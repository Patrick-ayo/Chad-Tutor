import { useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Clock3,
  HelpCircle,
  Loader2,
  NotebookPen,
  PlayCircle,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { fetchLectureSummary, type LectureQuizQuestion } from '@/lib/plannerApi';
import type { DetailedRoadmap, RoadmapDay, RoadmapSession } from '@/types/planner';

interface DetailedRoadmapViewProps {
  roadmap: DetailedRoadmap;
}

type SessionVideoWithHints = RoadmapSession['videos'][number] & {
  keyPoints?: string[];
};

type RoadmapSessionWithHints = RoadmapSession & {
  topicsCovered?: string[];
  videos: SessionVideoWithHints[];
};

type QuizAnswers = Record<number, 'A' | 'B' | 'C' | 'D'>;

function cleanItems(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => String(item || '').trim())
    .filter((item) => item.length > 0);
}

function splitConceptList(input: string): string[] {
  return input
    .split(/,| and /i)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getSessionTopics(session: RoadmapSession): string[] {
  const hintedTopics = cleanItems((session as RoadmapSessionWithHints).topicsCovered);
  if (hintedTopics.length > 0) {
    return hintedTopics;
  }

  const fromVideos = cleanItems(
    session.videos.flatMap((video) => (video as SessionVideoWithHints).keyPoints ?? []),
  );
  if (fromVideos.length > 0) {
    return Array.from(new Set(fromVideos)).slice(0, 6);
  }

  const coverMatch = session.keyOutcome.match(/covering (.+?)(?:\.|$)/i);
  if (coverMatch?.[1]) {
    const parsed = splitConceptList(coverMatch[1]).filter((item) => item.length > 0);
    if (parsed.length > 0) {
      return parsed;
    }
  }

  if (session.revisitNotes.length > 0) {
    return session.revisitNotes.slice(0, 4);
  }

  return [session.keyOutcome || session.title].filter(Boolean);
}

function getVideoKeyPoints(video: RoadmapSession['videos'][number]): string[] {
  return cleanItems((video as SessionVideoWithHints).keyPoints).slice(0, 4);
}

function getVideoDurationLabel(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  return `${minutes} min`;
}

function getVideoBrief(video: RoadmapSession['videos'][number]): string | null {
  const keyPoints = getVideoKeyPoints(video);
  if (keyPoints.length < 2) {
    return null;
  }

  return `${keyPoints[0]}. ${keyPoints[1]}.`;
}

function getPracticePrompt(video: RoadmapSession['videos'][number], session: RoadmapSession): string {
  const keyPoints = getVideoKeyPoints(video);

  if (keyPoints.length >= 2) {
    return `Practice explaining ${keyPoints[0].toLowerCase()} and ${keyPoints[1].toLowerCase()} from memory, then solve one quick example without notes.`;
  }

  if (keyPoints.length === 1) {
    return `Practice recalling ${keyPoints[0].toLowerCase()} from memory, then give one concrete example.`;
  }

  return `Practice the core idea from ${video.title} using one example and one recall question tied to ${session.keyOutcome}.`;
}

function normalizeQuizQuestions(input: unknown): LectureQuizQuestion[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((item) => {
      if (!item || typeof item !== 'object') {
        return null;
      }

      const raw = item as Record<string, unknown>;
      const options = raw.options as Record<string, unknown> | undefined;
      const correct = String(raw.correct || '').toUpperCase();

      if (!options || !['A', 'B', 'C', 'D'].includes(correct)) {
        return null;
      }

      return {
        question: String(raw.question || '').trim(),
        options: {
          A: String(options.A || '').trim(),
          B: String(options.B || '').trim(),
          C: String(options.C || '').trim(),
          D: String(options.D || '').trim(),
        },
        correct: correct as LectureQuizQuestion['correct'],
        explanation: String(raw.explanation || '').trim(),
      };
    })
    .filter((item): item is LectureQuizQuestion => Boolean(item));
}

function SessionQuizPanel({ session, unlocked }: { session: RoadmapSession; unlocked: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<LectureQuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  const primaryVideo = session.videos[0];
  const canLoad = Boolean(primaryVideo);

  const quizScore = useMemo(() => {
    if (!questions) {
      return 0;
    }

    return questions.reduce((score, question, index) => {
      return answers[index] === question.correct ? score + 1 : score;
    }, 0);
  }, [answers, questions]);

  const loadQuiz = async () => {
    if (!unlocked || !canLoad || loading || questions !== null || !primaryVideo) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchLectureSummary(primaryVideo.id, 'quiz', primaryVideo.title, session.topicName);
      const parsed = 'questions' in response ? normalizeQuizQuestions(response.questions) : [];
      setQuestions(parsed);
      setAnswers({});
    } catch (loadError) {
      setError('Could not load quiz - tap to retry');
      console.error('Failed to load roadmap quiz:', loadError);
    } finally {
      setLoading(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-colors dark:border-slate-700 dark:bg-slate-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Quiz</p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Watch every video in this session to unlock the quiz.</p>
          </div>
          <Button disabled variant="secondary" className="rounded-full">
            🔒 Quiz (Complete videos first)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-sky-50/70 p-4 transition-all duration-300 dark:border-slate-700 dark:bg-slate-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Quiz</p>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Unlocked after all videos are watched.</p>
        </div>
        <Button
          type="button"
          onClick={() => void loadQuiz()}
          disabled={!canLoad || loading}
          className="rounded-full"
          variant="default"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          ❓ Start Quiz
        </Button>
      </div>

      {!canLoad && (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">No video is available to anchor the quiz for this session.</p>
      )}

      {loading && (
        <div className="mt-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading quiz...
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
          <p>{error}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              setError(null);
              setQuestions(null);
              void loadQuiz();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && questions && questions.length > 0 && (
        <div className="mt-4 space-y-4">
          {questions.map((question, index) => {
            const selected = answers[index];
            const isCorrect = selected === question.correct;

            return (
              <div key={`${question.question}-${index}`} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/70">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {index + 1}. {question.question}
                </p>
                <div className="grid gap-2">
                  {(['A', 'B', 'C', 'D'] as const).map((key) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="h-auto justify-start py-2 text-left"
                      disabled={Boolean(selected)}
                      onClick={() => {
                        setAnswers((current) => ({
                          ...current,
                          [index]: key,
                        }));
                      }}
                    >
                      <span className="mr-2 font-semibold">{key}.</span>
                      <span>{question.options[key]}</span>
                    </Button>
                  ))}
                </div>

                {selected && (
                  <div className={`rounded-md px-3 py-2 text-sm ${isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
                    <p className="font-medium">{isCorrect ? 'Correct' : `Incorrect (correct answer: ${question.correct})`}</p>
                    <p className="mt-1">{question.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}

          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 text-sm font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100">
            Score: {quizScore}/{questions.length} correct
          </div>
        </div>
      )}

      {!loading && !error && questions && questions.length === 0 && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">No quiz questions were generated for this session yet.</p>
      )}
    </div>
  );
}

function SessionCard({ session }: { session: RoadmapSession }) {
  const [watchedVideos, setWatchedVideos] = useState<Set<string>>(() => new Set());

  const sessionUnlocked = session.videos.length === 0 || watchedVideos.size === session.videos.length;
  const topicsCovered = getSessionTopics(session);

  const markWatched = (videoId: string) => {
    setWatchedVideos((current) => {
      if (current.has(videoId)) {
        return current;
      }

      const next = new Set(current);
      next.add(videoId);
      return next;
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/85 p-4 shadow-sm backdrop-blur-sm transition-colors dark:border-slate-700/80 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-[0.24em] dark:bg-slate-800 dark:text-slate-100">
              {session.label}
            </Badge>
            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[11px] dark:border-slate-700 dark:text-slate-200">
              {session.clusterId}
            </Badge>
          </div>
          <h4 className="mt-2 text-base font-semibold text-slate-900 dark:text-slate-50">{session.title}</h4>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{session.keyOutcome}</p>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <Clock3 className="h-3.5 w-3.5" />
          {session.totalMinutes} min
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/35">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">What you'll learn:</p>
        <ul className="mt-2 space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
          {topicsCovered.map((topic) => (
            <li key={topic} className="flex gap-2 leading-6">
              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-slate-400 dark:bg-slate-500" />
              <span>{topic}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 space-y-3">
        {session.videos.map((video) => {
          const watched = watchedVideos.has(video.id);
          const keyPoints = getVideoKeyPoints(video);
          const brief = getVideoBrief(video);
          const practicePrompt = getPracticePrompt(video, session);
          const sessionPractice = session.phases.find((phase) => phase.phase === 'practice')?.practice;

          return (
            <div key={video.id} className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors dark:border-slate-700 dark:bg-slate-950/50">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950">
                      <PlayCircle className="h-3.5 w-3.5" />
                    </span>
                    <h5 className="min-w-0 text-sm font-semibold text-slate-900 dark:text-slate-50">{video.title}</h5>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{getVideoDurationLabel(video.durationSeconds)}</span>
                  </div>

                  {brief && <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{brief}</p>}
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={watched ? 'secondary' : 'default'}
                  className="rounded-full"
                  onClick={() => markWatched(video.id)}
                >
                  {watched ? '✓ Watched' : '▶ Watch'}
                </Button>
              </div>

              {watched && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/35 dark:text-amber-50">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">Mini practice</p>
                      <Badge variant="outline" className="border-amber-300 bg-white/80 text-[10px] font-normal text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
                        After watch
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-amber-900/80 dark:text-amber-100/80">{practicePrompt}</p>
                    {sessionPractice?.title && <p className="mt-2 text-xs font-medium text-amber-900/90 dark:text-amber-100">{sessionPractice.title}</p>}
                    {keyPoints.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {keyPoints.map((checkpoint) => (
                          <Badge key={checkpoint} variant="outline" className="border-amber-300 bg-white/80 text-[10px] font-normal text-amber-900 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-100">
                            {checkpoint}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {keyPoints.length > 0 && (
                    <details className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-900/40">
                      <summary className="cursor-pointer list-none text-sm font-medium text-slate-900 dark:text-slate-50">Key points</summary>
                      <ul className="mt-3 space-y-1.5 text-sm text-slate-700 dark:text-slate-200">
                        {keyPoints.map((point) => (
                          <li key={point} className="flex gap-2 leading-6">
                            <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-slate-400 dark:bg-slate-500" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div
        className={`mt-4 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 transition-all duration-300 dark:border-slate-700 dark:bg-slate-950/30 ${
          sessionUnlocked ? 'max-h-96 opacity-100 translate-y-0' : 'max-h-0 border-transparent p-0 opacity-0 -translate-y-2'
        }`}
        aria-hidden={!sessionUnlocked}
      >
        {sessionUnlocked && session.revisitNotes.length > 0 && (
          <>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Revision notes</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {session.revisitNotes.map((note) => (
                <Badge key={note} variant="outline" className="border-slate-300 bg-white text-[11px] font-normal text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                  {note}
                </Badge>
              ))}
            </div>
          </>
        )}
      </div>

      <SessionQuizPanel session={session} unlocked={sessionUnlocked} />
    </div>
  );
}

function DayCard({
  day,
  isOpen,
  onToggle,
}: {
  day: RoadmapDay;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const progress = day.totalMinutes > 0 ? 100 : 0;

  return (
    <Card className="overflow-hidden border-slate-200/80 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950">
      <CardHeader className="border-b border-slate-200/80 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarDays className="h-5 w-5" />
              {day.label}
            </CardTitle>
            <p className="mt-2 text-sm text-slate-200 dark:text-slate-300">{day.title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-300 dark:text-slate-400">{day.summary}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
              {day.totalMinutes} min
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 rounded-full text-white hover:bg-white/15 hover:text-white"
              aria-label={isOpen ? `Collapse ${day.label}` : `Expand ${day.label}`}
            >
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <Progress value={progress} className="mt-4 h-1.5 bg-white/15 dark:bg-slate-800" />
      </CardHeader>
      <CardContent className="space-y-4 p-4 sm:p-5 dark:bg-slate-950">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <Badge variant="secondary" className="rounded-full dark:bg-slate-800 dark:text-slate-100">
            <Sparkles className="mr-1 h-3 w-3" />
            {day.focus}
          </Badge>
          <Badge variant="outline" className="rounded-full dark:border-slate-700 dark:text-slate-200">
            {day.sessions.length} session{day.sessions.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {isOpen ? (
          <div className="space-y-4">
            {day.sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 text-sm text-slate-600 transition-colors dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
            Collapsed view. Expand this day to see the full watch → practice → quiz flow.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DetailedRoadmapView({ roadmap }: DetailedRoadmapViewProps) {
  const [expandedDays, setExpandedDays] = useState<number[]>(() => (roadmap.days[0] ? [roadmap.days[0].dayNumber] : []));

  const stats = useMemo(() => {
    const sessionCount = roadmap.days.reduce((sum, day) => sum + day.sessions.length, 0);
    return {
      days: roadmap.totalDays,
      minutes: roadmap.totalMinutes,
      sessions: sessionCount,
    };
  }, [roadmap]);

  const toggleDay = (dayNumber: number) => {
    setExpandedDays((current) =>
      current.includes(dayNumber)
        ? current.filter((value) => value !== dayNumber)
        : [...current, dayNumber],
    );
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 shadow-sm dark:border-slate-800 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                Detailed Roadmap
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">{roadmap.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{roadmap.overview}</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center text-sm">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Days</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{stats.days}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Minutes</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{stats.minutes}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Sessions</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">{stats.sessions}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
            <Badge variant="secondary" className="rounded-full">
              <Clock3 className="mr-1 h-3 w-3" />
              Day-labeled sessions
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              <PlayCircle className="mr-1 h-3 w-3" />
              Watch first
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              <NotebookPen className="mr-1 h-3 w-3" />
              Practice next
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              <HelpCircle className="mr-1 h-3 w-3" />
              Quiz last
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        {roadmap.days.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            isOpen={expandedDays.includes(day.dayNumber)}
            onToggle={() => toggleDay(day.dayNumber)}
          />
        ))}
      </div>
    </div>
  );
}
