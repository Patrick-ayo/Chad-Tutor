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

export function RoadmapSidebar({ node, roadmapId, isOpen, onClose }: RoadmapSidebarProps) {
  console.log("RoadmapSidebar node prop:", node);

  const [activeTab, setActiveTab] = useState<"resources" | "ai-tutor">("resources");
  const [resourcesData, setResourcesData] = useState<any>(null);
  const [youtubeVideos, setYoutubeVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(false);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [resourceData, setResourceData] = useState<any>(null);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

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
          maxResults: 5,
        }),
      });

      const data = await response.json();
      setYoutubeVideos(data.videos || []);
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
    window.location.href = `/quiz/${node.id}`;
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

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-[1000] h-screen w-[450px] border-l border-white/10 bg-[#1a1a1a] shadow-[-4px_0_20px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
      aria-hidden={!isOpen}
    >
      <div className="flex h-full flex-col">
        <header className="border-b border-white/10 px-6 pb-4 pt-5">
          <div className="mb-4 flex items-start justify-end">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-md p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          {mergedNode && (
            <>
              <h2 className="mb-4 text-2xl font-bold text-white">{mergedNode.title}</h2>
              <p className="mb-6 text-sm leading-relaxed text-gray-400">
                {mergedNode.description || "No description available"}
              </p>
            </>
          )}

          <div className="mb-6 border-b border-white/10">
            <div className="flex items-center gap-6">
              <div className="mb-6 flex gap-4 border-b border-gray-700">
                <button
                  onClick={() => setActiveTab("resources")}
                  className={`pb-2 px-1 transition-colors ${
                    activeTab === "resources"
                      ? "border-b-2 border-green-500 text-green-400"
                      : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  📚 Resources
                </button>
                <button
                  onClick={() => setActiveTab("ai-tutor")}
                  className={`pb-2 px-1 transition-colors ${
                    activeTab === "ai-tutor"
                      ? "border-b-2 border-purple-500 text-purple-400"
                      : "text-gray-400 hover:text-gray-300"
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
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
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
                <div className="bg-gray-800/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {shownDescription}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
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
                        className="animate-pulse bg-gray-700 h-20 rounded-lg"
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
                  <p className="text-gray-500 text-sm">
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
                        className="animate-pulse bg-gray-700 h-20 rounded-lg"
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
                  <p className="text-gray-500 text-sm">
                    No premium resources available yet
                  </p>
                )}
              </div>
            </div>
          )}
          {activeTab === "ai-tutor" && (
            <div className="space-y-6">
              <div>
                <h3 className="mb-3 font-semibold text-white">🎥 Find YouTube Tutorials</h3>
                <button
                  onClick={handleSearchYouTube}
                  disabled={isLoadingVideos}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoadingVideos ? "Searching..." : "Search YouTube Videos"}
                </button>

                {youtubeVideos.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {youtubeVideos.map((video: YoutubeVideo, idx: number) => (
                      <a
                        key={idx}
                        href={video.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg bg-gray-800 p-3 transition-colors hover:bg-gray-700"
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
                            <h4 className="line-clamp-2 text-sm font-medium text-white">
                              {video.title}
                            </h4>
                            <p className="mt-1 text-xs text-gray-400">{video.channelName}</p>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-white">📅 Generate Study Plan</h3>
                <div className="mb-3">
                  <label className="mb-2 block text-sm text-gray-400">How many days do you have?</label>
                  <input
                    type="number"
                    defaultValue={7}
                    min={1}
                    max={30}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                    id="study-days-input"
                  />
                </div>
                <button
                  onClick={handleGenerateStudyPlan}
                  disabled={isGeneratingPlan}
                  className="w-full rounded-lg bg-purple-600 px-4 py-2 text-white transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                  {isGeneratingPlan ? "Generating..." : "Generate Study Plan"}
                </button>

                {studyPlan && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-green-400">
                      ✓ {studyPlan.totalDays}-day plan created ({studyPlan.totalHours}h total)
                    </p>
                    {studyPlan.sessions?.map((session: StudySession, idx: number) => (
                      <div key={idx} className="rounded-lg bg-gray-800 p-3">
                        <h4 className="font-medium text-white">
                          Day {session.day}: {session.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-400">{session.duration} minutes</p>
                        <ul className="mt-2 space-y-1">
                          {session.topics?.map((topic: string, i: number) => (
                            <li key={i} className="text-sm text-gray-300">
                              • {topic}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="mb-3 font-semibold text-white">✍️ Practice Quiz</h3>
                <button
                  onClick={handleGenerateQuiz}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                >
                  Generate 10 Questions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default RoadmapSidebar;
