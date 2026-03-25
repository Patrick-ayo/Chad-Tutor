import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import ResourceCard from "@/components/roadmap/ResourceCard";

interface RoadmapSidebarProps {
  node: {
    id: string;
    title: string;
    description: string;
    resources?: {
      free: Array<{
        type: "article" | "video" | "course";
        title: string;
        url: string;
      }>;
      premium: Array<{
        type: "article" | "video" | "course";
        title: string;
        url: string;
        discount?: string;
      }>;
    };
  } | null;
  roadmapId: string;
  isOpen: boolean;
  onClose: () => void;
}

type YoutubeVideo = {
  title: string;
  url: string;
  thumbnail?: string;
  channelName?: string;
};

type StudySession = {
  day: number;
  title: string;
  duration: number;
  topics?: string[];
};

type StudyPlan = {
  totalDays: number;
  totalHours: number;
  sessions?: StudySession[];
};

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  difficulty?: string;
};

function buildLocalFallbackQuizQuestions(topic: string, count: number = 3): QuizQuestion[] {
  const safeCount = Math.max(1, Math.min(3, count));
  const templates: Omit<QuizQuestion, 'id'>[] = [
    {
      question: `What is the best first step when learning ${topic}?`,
      options: [
        'Start with fundamentals and a small practical task',
        'Skip basics and start with advanced optimization',
        'Memorize definitions without implementing anything',
        'Avoid feedback and testing',
      ],
      correctAnswer: 0,
      explanation: 'Strong fundamentals plus practice produces consistent progress.',
      difficulty: 'beginner',
    },
    {
      question: `How can you verify your understanding of ${topic}?`,
      options: [
        'By only watching tutorials',
        'By completing tasks and checking outcomes',
        'By reading notes once',
        'By avoiding quizzes',
      ],
      correctAnswer: 1,
      explanation: 'Hands-on validation confirms whether concepts can be applied correctly.',
      difficulty: 'intermediate',
    },
    {
      question: `What makes learning ${topic} sustainable over time?`,
      options: [
        'Irregular, random study sessions',
        'Only collecting resources',
        'Consistent practice, reflection, and iteration',
        'Focusing only on theory',
      ],
      correctAnswer: 2,
      explanation: 'Consistency and iterative learning are key to long-term retention.',
      difficulty: 'advanced',
    },
  ];

  return Array.from({ length: safeCount }, (_, index) => ({
    id: `local-q-${index + 1}`,
    ...templates[index % templates.length],
  }));
}

export function RoadmapSidebar({ node, roadmapId, isOpen, onClose }: RoadmapSidebarProps) {
  console.log("RoadmapSidebar node prop:", node);
  const [isDark, setIsDark] = useState<boolean>(() =>
    typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : false
  );

  const [activeTab, setActiveTab] = useState<"resources" | "ai-tutor">("resources");
  const [resourcesData, setResourcesData] = useState<any>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ correct: number; total: number } | null>(null);
  const [quizSubmitError, setQuizSubmitError] = useState<string | null>(null);
  const [resourceData, setResourceData] = useState<any>(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    const syncTheme = () => {
      setIsDark(root.classList.contains("dark"));
    };

    syncTheme();

    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
    };
  }, []);

  const normalizeResourcePayload = useCallback((payload: any) => {
    if (!payload) return null;

    const freeResources = Array.isArray(payload.freeResources)
      ? payload.freeResources
      : Array.isArray(payload.free)
        ? payload.free
        : [];

    const premiumResources = Array.isArray(payload.premiumResources)
      ? payload.premiumResources
      : Array.isArray(payload.premium)
        ? payload.premium
        : [];

    return {
      description: payload.description || node?.description || "No description available",
      freeResources,
      premiumResources,
    };
  }, [node?.description]);

  const handleSearchYouTube = async () => {
    if (!node) return;

    setIsLoadingVideos(true);
    try {
      const response = await fetch("/api/youtube/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: node.title,
          maxResults: 3,
        }),
      });

      const data = await response.json();
      const topVideos = Array.isArray(data?.videos) ? data.videos.slice(0, 3) : [];
      setYoutubeVideos(topVideos);
    } catch (fetchError) {
      console.error("YouTube search failed:", fetchError);
      alert("Failed to search YouTube. Please try again.");
    } finally {
      setIsLoadingVideos(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!node) return;

    const daysInput = document.getElementById("study-days-input") as HTMLInputElement;
    const days = parseInt(daysInput?.value || "7", 10);

    setIsGeneratingPlan(true);
    try {
      const response = await fetch("/api/ai/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeTitle: node.title,
          nodeDescription: node.description,
          availableDays: days,
        }),
      });

      const data = await response.json();
      setStudyPlan(data);
    } catch (fetchError) {
      console.error("Study plan generation failed:", fetchError);
      alert("Failed to generate study plan. Please try again.");
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateQuiz = () => {
    if (!node) return;

    const generateQuiz = async () => {
      setIsGeneratingQuiz(true);
      setQuizError(null);
      setQuizSubmitError(null);
      setSelectedAnswers({});
      setQuizSubmitted(false);
      setQuizScore(null);

      try {
        const response = await fetch("/api/ai/generate-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nodeTitle: node.title,
            nodeDescription: node.description,
            questionCount: 3,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to generate quiz: ${response.status}`);
        }

        const data = await response.json();
        const questions = Array.isArray(data?.questions) ? data.questions.slice(0, 3) : [];

        if (!questions.length) {
          throw new Error("No quiz questions were returned.");
        }

        setQuizQuestions(questions);
      } catch (error) {
        console.error("Quiz generation failed:", error);
        setQuizQuestions(buildLocalFallbackQuizQuestions(node.title, 3));
        setQuizError("AI is unavailable right now. Showing fallback questions.");
      } finally {
        setIsGeneratingQuiz(false);
      }
    };

    void generateQuiz();
  };

  const handleSelectQuizOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) {
      return;
    }

    setQuizSubmitError(null);
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = () => {
    if (!quizQuestions.length) {
      return;
    }

    const unanswered = quizQuestions.some((q) => typeof selectedAnswers[q.id] !== "number");
    if (unanswered) {
      setQuizSubmitError("Please select an option for each question before submitting.");
      return;
    }

    const correct = quizQuestions.reduce((count, question) => {
      return count + (selectedAnswers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);

    setQuizScore({ correct, total: quizQuestions.length });
    setQuizSubmitted(true);
    setQuizSubmitError(null);
  };

  const handleResetQuizAnswers = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setQuizSubmitError(null);
  };

  useEffect(() => {
    console.log("Sidebar node:", node);
    console.log("Sidebar isOpen:", isOpen);
    console.log("Node resources:", node?.resources);
  }, [node, isOpen]);

  useEffect(() => {
    if (!node || !isOpen) return;

    const fetchResources = async () => {
      try {
        const response = await fetch(`/api/roadmaps/${roadmapId}/nodes/${node.id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }

        const data = await response.json();
        const dbResources = data?.data?.resources ?? null;
        setResourcesData(dbResources);

        // Warm UI with DB-backed resources immediately if available.
        const normalized = normalizeResourcePayload(dbResources);
        if (normalized) {
          setResourceData(normalized);
        }
      } catch (err) {
        console.error("Error fetching resources:", err);
      }
    };

    fetchResources();
  }, [node?.id, isOpen, roadmapId]);

  const loadResources = useCallback(async () => {
    if (!isOpen || !node) return;

    setIsLoadingResources(true);
    setResourceError(null);

    const fallback = normalizeResourcePayload(resourcesData ?? node.resources);
    if (fallback) {
      setResourceData(fallback);
    }

    try {
      const response = await fetch("/api/ai/generate-resources", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nodeTitle: node.title,
          nodeDescription: node.description || "",
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch resources: ${response.status}`);
      }

      const result = await response.json();
      if (result?.success && result?.data) {
        const normalized = normalizeResourcePayload(result.data);
        setResourceData(normalized);
        return;
      }

      throw new Error(result?.message || "Failed to load resources");
    } catch (error) {
      console.error("Error fetching resources:", error);

      // Keep fallback content visible; show blocking error only when no data exists.
      if (!fallback) {
        setResourceError("Failed to load resources. Please try again.");
      }
    } finally {
      setIsLoadingResources(false);
    }
  }, [isOpen, node, normalizeResourcePayload, resourcesData]);

  useEffect(() => {
    void loadResources();
  }, [loadResources]);

  useEffect(() => {
    if (!isOpen || !node) {
      return;
    }

    // Always default to Resources when a node is opened/clicked.
    setActiveTab("resources");
    setQuizSubmitError(null);
    setQuizError(null);
  }, [isOpen, node?.id]);

  if (!node) return null;

  const buildReadableDescription = (base: string | undefined, title: string): string => {
    const raw = (base || '').trim();
    if (raw.length >= 120) {
      return raw;
    }

    if (!raw) {
      return `${title} is an important topic in this roadmap. Focus on the fundamentals first, then move into practical implementation patterns and common real-world use cases. As you progress, aim to connect concepts with hands-on tasks so the knowledge becomes durable and job-ready.`;
    }

    return `${raw}. In practice, this topic includes core principles, essential tools, and repeatable workflows you will use in real projects. Build confidence by learning the concepts in sequence and applying them through small exercises before advancing to more complex scenarios.`;
  };

  const mergedNode = {
    ...node,
    resources: resourcesData ?? node.resources,
  };

  const shownDescription = buildReadableDescription(
    resourceData?.description || mergedNode.description,
    mergedNode.title
  );

  const panelSurfaceClass = isDark ? "bg-black" : "bg-white";
  const cardSurfaceClass = isDark ? "border border-white/10 bg-black" : "border border-gray-200 bg-white";

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-[1000] h-screen w-[450px] border-l transition-transform duration-300 ease-in-out ${
        isDark
          ? "border-white/10 bg-black shadow-[-4px_0_20px_rgba(0,0,0,0.5)]"
          : "border-gray-200 bg-white shadow-[-4px_0_20px_rgba(0,0,0,0.12)]"
      } ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex h-full flex-col">
        <header className={`border-b px-6 pb-4 pt-5 ${panelSurfaceClass} ${isDark ? "border-white/10" : "border-gray-200"}`}>
          <div className="mb-4 flex items-start justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className={`rounded-md p-2 transition-colors ${
                isDark
                  ? "text-gray-400 hover:bg-white/10 hover:text-white"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className={`flex-1 overflow-y-auto p-6 ${panelSurfaceClass}`}>
          {mergedNode && (
            <>
              <h2 className={`mb-4 text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>{mergedNode.title}</h2>
              <p className={`mb-6 text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {mergedNode.description || "No description available"}
              </p>
            </>
          )}

          <div className={`mb-6 border-b ${isDark ? "border-white/10" : "border-gray-200"}`}>
            <div className="flex items-center gap-6">
              <div className={`mb-6 flex gap-4 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`pb-2 px-1 transition-colors ${
                    activeTab === "resources"
                      ? "border-b-2 border-green-500 text-green-400"
                      : isDark
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  📚 Resources
                </button>
                <button
                  onClick={() => setActiveTab("ai-tutor")}
                  className={`pb-2 px-1 transition-colors ${
                    activeTab === "ai-tutor"
                      ? "border-b-2 border-purple-500 text-purple-400"
                      : isDark
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  🤖 AI Tutor
                </button>
              </div>
            </div>
          </div>

          {activeTab === "resources" && (
            <div className="space-y-6">
              {/* Description Section */}
              {isLoadingResources ? (
                <div className="animate-pulse">
                  <div className={`h-4 rounded w-3/4 mb-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
                  <div className={`h-4 rounded w-full mb-2 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
                  <div className={`h-4 rounded w-5/6 ${isDark ? "bg-gray-700" : "bg-gray-200"}`}></div>
                </div>
              ) : resourceError ? (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{resourceError}</p>
                  <button
                    onClick={() => void loadResources()}
                    className="mt-2 text-red-300 underline text-sm"
                  >
                    Retry
                  </button>
                </div>
              ) : resourceData?.description ? (
                <div className={`rounded-lg p-4 ${cardSurfaceClass}`}>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    {shownDescription}
                  </p>
                </div>
              ) : (
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {shownDescription}
                </p>
              )}

              {/* Free Resources Section */}
              <div>
                <h3 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                  📚 Free Resources
                </h3>

                {isLoadingResources ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`animate-pulse h-20 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                      ></div>
                    ))}
                  </div>
                ) : resourceData?.freeResources &&
                  resourceData.freeResources.length > 0 ? (
                  <div className="space-y-3">
                    {resourceData.freeResources.map((resource: any, idx: number) => (
                      <ResourceCard
                        key={idx}
                        type={resource.type}
                        title={resource.title}
                        url={resource.url}
                      />
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    No free resources available yet
                  </p>
                )}
              </div>

              {/* Premium Resources Section */}
              <div>
                <h3 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                  ⭐ Premium Resources
                </h3>

                {isLoadingResources ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className={`animate-pulse h-20 rounded-lg ${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                      ></div>
                    ))}
                  </div>
                ) : resourceData?.premiumResources &&
                  resourceData.premiumResources.length > 0 ? (
                  <div className="space-y-3">
                    {resourceData.premiumResources.map((resource: any, idx: number) => (
                      <ResourceCard
                        key={idx}
                        type={resource.type}
                        title={resource.title}
                        url={resource.url}
                        discount={resource.discount}
                        isPremium
                      />
                    ))}
                  </div>
                ) : (
                  <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-500"}`}>
                    No premium resources available yet
                  </p>
                )}
              </div>
            </div>
          )}
          {activeTab === "ai-tutor" && (
            <div className="space-y-6">
              <div>
                <h3 className={`mb-3 font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>🎥 Find YouTube Tutorials</h3>
                <button
                  onClick={handleSearchYouTube}
                  disabled={isLoadingVideos}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoadingVideos ? "Searching..." : "Search YouTube Videos"}
                </button>

                {youtubeVideos.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>Showing top 3 videos</p>
                    {youtubeVideos.map((video: YoutubeVideo, idx: number) => (
                      <a
                        key={idx}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`block rounded-lg p-3 transition-colors ${
                          isDark ? "border border-white/10 bg-black hover:bg-neutral-950" : "border border-gray-200 bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex gap-3">
                          {video.thumbnail && (
                            <img
                              src={video.thumbnail}
                              alt=""
                              className="h-16 w-24 rounded object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h4 className={`line-clamp-2 text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                              {video.title}
                            </h4>
                            <p className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>{video.channelName}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>



              <div>
                <h3 className={`mb-3 font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>✍️ Practice Quiz</h3>
                <button
                  onClick={handleGenerateQuiz}
                  disabled={isGeneratingQuiz}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                >
                  {isGeneratingQuiz ? "Generating..." : "Generate Top 3 Questions"}
                </button>

                {quizError && (
                  <p className="mt-3 text-sm text-red-400">{quizError}</p>
                )}

                {quizSubmitError && (
                  <p className="mt-3 text-sm text-amber-400">{quizSubmitError}</p>
                )}

                {quizQuestions.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      Showing top 3 questions for {node.title}
                    </p>
                    {quizQuestions.map((quiz, idx) => (
                      <div
                        key={quiz.id || `quiz-${idx}`}
                        className={`rounded-lg p-3 ${cardSurfaceClass}`}
                      >
                        <p className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                          {idx + 1}. {quiz.question}
                        </p>
                        {Array.isArray(quiz.options) && quiz.options.length > 0 && (
                          <ul className="mt-2 space-y-2">
                            {quiz.options.map((option, optionIdx) => (
                              <li key={`${quiz.id || idx}-opt-${optionIdx}`}>
                                <button
                                  type="button"
                                  onClick={() => handleSelectQuizOption(quiz.id, optionIdx)}
                                  disabled={quizSubmitted}
                                  className={`w-full rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                                    (() => {
                                      const selected = selectedAnswers[quiz.id] === optionIdx;
                                      const isCorrect = optionIdx === quiz.correctAnswer;

                                      if (quizSubmitted) {
                                        if (isCorrect) {
                                          return "border-green-500 bg-green-500/15 text-green-300";
                                        }
                                        if (selected && !isCorrect) {
                                          return "border-red-500 bg-red-500/15 text-red-300";
                                        }
                                        return isDark
                                          ? "border-white/10 bg-black text-gray-300"
                                          : "border-gray-200 bg-white text-gray-700";
                                      }

                                      if (selected) {
                                        return "border-blue-500 bg-blue-500/15 text-blue-300";
                                      }

                                      return isDark
                                        ? "border-white/10 bg-black text-gray-300 hover:bg-neutral-950"
                                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50";
                                    })()
                                  }`}
                                >
                                  <span className="mr-1 font-semibold">{String.fromCharCode(65 + optionIdx)}.</span> {option}
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}

                        {quizSubmitted && quiz.explanation && (
                          <p className={`mt-2 text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                            Explanation: {quiz.explanation}
                          </p>
                        )}
                      </div>
                    ))}

                    {!quizSubmitted ? (
                      <button
                        type="button"
                        onClick={handleSubmitQuiz}
                        className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-700"
                      >
                        Submit Answers
                      </button>
                    ) : (
                      <div className={`rounded-lg p-3 ${cardSurfaceClass}`}>
                        <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
                          Result: {quizScore?.correct ?? 0}/{quizScore?.total ?? quizQuestions.length} correct
                        </p>
                        <p className={`mt-1 text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                          Score: {quizScore ? Math.round((quizScore.correct / quizScore.total) * 100) : 0}%
                        </p>
                        <button
                          type="button"
                          onClick={handleResetQuizAnswers}
                          className="mt-3 w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                        >
                          Try Again
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default RoadmapSidebar;
