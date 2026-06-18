import { useMemo, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  fetchLectureSummary,
  type LectureQuizQuestion,
} from '@/lib/plannerApi';

type LectureTab = 'transcript' | 'overview' | 'insight' | 'quiz';

type QuizAnswers = Record<number, 'A' | 'B' | 'C' | 'D'>;

interface LectureSummaryPanelProps {
  videoId: string;
  videoTitle: string;
  topicName: string;
  taskId: string;
}

interface TabState<T> {
  loading: boolean;
  error: string | null;
  content: T | null;
}

function createInitialTabState<T>(): TabState<T> {
  return {
    loading: false,
    error: null,
    content: null,
  };
}

const TAB_LABELS: Record<LectureTab, string> = {
  transcript: '📄 Transcript',
  overview: '📚 Overview',
  insight: '💡 Insight',
  quiz: '❓ Quiz',
};

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

function TabLoading() {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      Loading lecture content...
    </div>
  );
}

function TabError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="space-y-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
      <p>{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

export function LectureSummaryPanel({ videoId, videoTitle, topicName, taskId }: LectureSummaryPanelProps) {
  const [activeTab, setActiveTab] = useState<LectureTab>('transcript');

  const [transcript, setTranscript] = useState<TabState<string>>(createInitialTabState<string>());
  const [overview, setOverview] = useState<TabState<string>>(createInitialTabState<string>());
  const [insight, setInsight] = useState<TabState<string>>(createInitialTabState<string>());
  const [quiz, setQuiz] = useState<TabState<LectureQuizQuestion[]>>(createInitialTabState<LectureQuizQuestion[]>());

  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers>({});

  const canLoad = Boolean(videoId && taskId);

  const loadTranscript = async () => {
    if (!canLoad || transcript.loading || transcript.content !== null) {
      return;
    }

    setTranscript((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetchLectureSummary(videoId, 'transcript-summary', videoTitle, topicName, taskId);
      const rawContent = 'content' in response ? response.content : '';
      const content = typeof rawContent === 'string' ? rawContent : rawContent.summary;
      setTranscript({ loading: false, error: null, content });
    } catch (error) {
      setTranscript({
        loading: false,
        error: 'Could not load - tap to retry',
        content: null,
      });
      console.error('Failed to load transcript summary:', error);
    }
  };

  const loadOverview = async () => {
    if (!canLoad || overview.loading || overview.content !== null) {
      return;
    }

    setOverview((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetchLectureSummary(videoId, 'topic-overview', videoTitle, topicName, taskId);
      const rawContent = 'content' in response ? response.content : '';
      const content = typeof rawContent === 'string' ? rawContent : rawContent.summary;
      setOverview({ loading: false, error: null, content });
    } catch (error) {
      setOverview({
        loading: false,
        error: 'Could not load - tap to retry',
        content: null,
      });
      console.error('Failed to load topic overview:', error);
    }
  };

  const loadInsight = async () => {
    if (!canLoad || insight.loading || insight.content !== null) {
      return;
    }

    setInsight((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetchLectureSummary(videoId, 'expert-insight', videoTitle, topicName, taskId);
      const rawContent = 'content' in response ? response.content : '';
      const content = typeof rawContent === 'string' ? rawContent : rawContent.summary;
      setInsight({ loading: false, error: null, content });
    } catch (error) {
      setInsight({
        loading: false,
        error: 'Could not load - tap to retry',
        content: null,
      });
      console.error('Failed to load expert insight:', error);
    }
  };

  const loadQuiz = async () => {
    if (!canLoad || quiz.loading || quiz.content !== null) {
      return;
    }

    setQuiz((state) => ({ ...state, loading: true, error: null }));
    try {
      const response = await fetchLectureSummary(videoId, 'quiz', videoTitle, topicName, taskId);
      const questions = 'questions' in response ? normalizeQuizQuestions(response.questions) : [];
      setQuiz({ loading: false, error: null, content: questions });
      setQuizAnswers({});
    } catch (error) {
      setQuiz({
        loading: false,
        error: 'Could not load - tap to retry',
        content: null,
      });
      console.error('Failed to load lecture quiz:', error);
    }
  };

  const handleTabChange = (value: string) => {
    const tab = value as LectureTab;
    setActiveTab(tab);

    if (tab === 'transcript') {
      void loadTranscript();
      return;
    }

    if (tab === 'overview') {
      void loadOverview();
      return;
    }

    if (tab === 'insight') {
      void loadInsight();
      return;
    }

    void loadQuiz();
  };

  const quizScore = useMemo(() => {
    if (!quiz.content) {
      return 0;
    }

    return quiz.content.reduce((score, question, index) => {
      return quizAnswers[index] === question.correct ? score + 1 : score;
    }, 0);
  }, [quiz.content, quizAnswers]);

  const renderPoweredBy = () => {
    if (activeTab === 'transcript' || activeTab === 'overview') {
      return <p className="text-xs text-muted-foreground">Powered by Groq · Llama 3</p>;
    }

    return <p className="text-xs text-muted-foreground">Powered by Gemini 1.5 Flash</p>;
  };

  if (!videoId) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Lecture Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList variant="line" className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="transcript" onClick={() => void loadTranscript()}>
              {TAB_LABELS.transcript}
            </TabsTrigger>
            <TabsTrigger value="overview" onClick={() => void loadOverview()}>
              {TAB_LABELS.overview}
            </TabsTrigger>
            <TabsTrigger value="insight" onClick={() => void loadInsight()}>
              {TAB_LABELS.insight}
            </TabsTrigger>
            <TabsTrigger value="quiz" onClick={() => void loadQuiz()}>
              {TAB_LABELS.quiz}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transcript" className="pt-2">
            {transcript.loading && <TabLoading />}
            {transcript.error && (
              <TabError
                message={transcript.error}
                onRetry={() => {
                  setTranscript(createInitialTabState<string>());
                  void loadTranscript();
                }}
              />
            )}
            {!transcript.loading && !transcript.error && transcript.content && (
              <p className="whitespace-pre-wrap text-sm leading-6">{transcript.content}</p>
            )}
          </TabsContent>

          <TabsContent value="overview" className="pt-2">
            {overview.loading && <TabLoading />}
            {overview.error && (
              <TabError
                message={overview.error}
                onRetry={() => {
                  setOverview(createInitialTabState<string>());
                  void loadOverview();
                }}
              />
            )}
            {!overview.loading && !overview.error && overview.content && (
              <p className="whitespace-pre-wrap text-sm leading-6">{overview.content}</p>
            )}
          </TabsContent>

          <TabsContent value="insight" className="pt-2">
            {insight.loading && <TabLoading />}
            {insight.error && (
              <TabError
                message={insight.error}
                onRetry={() => {
                  setInsight(createInitialTabState<string>());
                  void loadInsight();
                }}
              />
            )}
            {!insight.loading && !insight.error && insight.content && (
              <p className="whitespace-pre-wrap text-sm leading-6">{insight.content}</p>
            )}
          </TabsContent>

          <TabsContent value="quiz" className="pt-2 space-y-4">
            {quiz.loading && <TabLoading />}
            {quiz.error && (
              <TabError
                message={quiz.error}
                onRetry={() => {
                  setQuiz(createInitialTabState<LectureQuizQuestion[]>());
                  void loadQuiz();
                }}
              />
            )}
            {!quiz.loading && !quiz.error && quiz.content && quiz.content.length > 0 && (
              <div className="space-y-4">
                {quiz.content.map((question, index) => {
                  const selected = quizAnswers[index];
                  const isCorrect = selected === question.correct;

                  return (
                    <div key={`${question.question}-${index}`} className="space-y-2 rounded-lg border p-3">
                      <p className="text-sm font-medium">{index + 1}. {question.question}</p>
                      <div className="grid gap-2">
                        {(['A', 'B', 'C', 'D'] as const).map((key) => (
                          <Button
                            key={key}
                            variant="outline"
                            className="justify-start text-left h-auto py-2"
                            disabled={Boolean(selected)}
                            onClick={() => {
                              setQuizAnswers((state) => ({
                                ...state,
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

                <div className="rounded-lg border bg-muted/40 p-3 text-sm font-medium">
                  Score: {quizScore}/{quiz.content.length} correct
                </div>
              </div>
            )}
            {!quiz.loading && !quiz.error && quiz.content && quiz.content.length === 0 && (
              <p className="text-sm text-muted-foreground">No quiz questions were generated for this lecture yet.</p>
            )}
          </TabsContent>
        </Tabs>

        {renderPoweredBy()}
      </CardContent>
    </Card>
  );
}
