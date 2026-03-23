/**
 * ExplorePage Component
 * 
 * Displays roadmap blocks that can be clicked to reveal a flowchart
 * showing the skill hierarchy and relationships.
 */

import { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, BookOpen, Layers } from 'lucide-react';
import { RoadmapFlowchart } from './RoadmapFlowchart';
import { useNavigate } from 'react-router-dom';

// Types for roadmap data
interface RoadmapNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  width?: number;
  height?: number;
  difficulty: string;
  sortOrder: number;
}

interface RoadmapEdge {
  sourceId: string;
  targetId: string;
  edgeType: string;
}

interface RoadmapGraph {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  infoBlocks?: InfoBlock[];
}

interface InfoBlock {
  id: string;
  text: string;
  position: { x: number; y: number };
  width: number;
  type: 'tip' | 'warning' | 'info' | 'recommendation';
  linkedNodes?: string[];
}

const INFO_BLOCK_BOUNDS = {
  leftMinX: 80,
  leftMaxX: 320,
  rightMinX: 420,
  rightMaxX: 520,
  minY: 100,
  maxY: 1800,
  minWidth: 240,
  maxWidth: 260,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeInfoBlocks(blocks: InfoBlock[]): InfoBlock[] {
  return blocks.map((block, index) => {
    const isLeftSide = (block.position?.x ?? 0) < 400;
    const fallbackX = index % 2 === 0 ? 100 : 520;
    const rawX = Number.isFinite(block.position?.x) ? block.position.x : fallbackX;
    const rawY = Number.isFinite(block.position?.y) ? block.position.y : 150 + index * 180;
    const rawWidth = Number.isFinite(block.width) ? block.width : (isLeftSide ? 260 : 240);

    const x = isLeftSide
      ? clamp(rawX, INFO_BLOCK_BOUNDS.leftMinX, INFO_BLOCK_BOUNDS.leftMaxX)
      : clamp(rawX, INFO_BLOCK_BOUNDS.rightMinX, INFO_BLOCK_BOUNDS.rightMaxX);

    return {
      ...block,
      width: clamp(rawWidth, INFO_BLOCK_BOUNDS.minWidth, INFO_BLOCK_BOUNDS.maxWidth),
      position: {
        x,
        y: clamp(rawY, INFO_BLOCK_BOUNDS.minY, INFO_BLOCK_BOUNDS.maxY),
      },
    };
  });
}

interface Roadmap {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  nodeCount: number;
}

export function ExplorePage() {
  const navigate = useNavigate();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loadingRoadmaps, setLoadingRoadmaps] = useState(true);
  const [expandedRoadmap, setExpandedRoadmap] = useState<Roadmap | null>(null);
  const [graphData, setGraphData] = useState<RoadmapGraph | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [roadmapDescription, setRoadmapDescription] = useState('');
  const [relatedTracks, setRelatedTracks] = useState<string[]>([]);
  const [targetAudience, setTargetAudience] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [prerequisites, setPrerequisites] = useState<string[] | string>([]);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isLoadingInfoBlocks, setIsLoadingInfoBlocks] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [infoBlocks, setInfoBlocks] = useState<InfoBlock[]>([]);

  // Fetch roadmaps from API on mount
  useEffect(() => {
    async function fetchRoadmaps() {
      setLoadingRoadmaps(true);
      try {
        const response = await fetch('/api/roadmaps');
        if (response.ok) {
          const data = await response.json();
          setRoadmaps(data);
        }
      } catch (error) {
        console.error('Failed to fetch roadmaps:', error);
      } finally {
        setLoadingRoadmaps(false);
      }
    }
    fetchRoadmaps();
  }, []);

  const handleRoadmapClick = async (roadmap: Roadmap) => {
    setExpandedRoadmap(roadmap);
    setLoading(true);
  };

  const handleBack = () => {
    setExpandedRoadmap(null);
    setGraphData(null);
    setRoadmapDescription('');
    setRelatedTracks([]);
    setTargetAudience('');
    setEstimatedTime('');
    setPrerequisites([]);
    setIsLoadingInfo(true);
    setIsLoadingInfoBlocks(false);
    setCompletedCount(0);
    setTotalCount(0);
    setInfoBlocks([]);
  };

  const handleExpandedBack = () => {
    handleBack();
    navigate('/explore');
  };

  const handleRelatedTrackClick = async (track: string) => {
    const matchedRoadmap = roadmaps.find((roadmap) => roadmap.name === track);
    if (!matchedRoadmap) return;
    await handleRoadmapClick(matchedRoadmap);
  };

  useEffect(() => {
    if (!expandedRoadmap) {
      return;
    }

    const fetchRoadmapMetadata = async () => {
      setLoading(true);
      setIsLoadingInfo(true);

      try {
        // First fetch roadmap graph data from backend
        const roadmapResponse = await fetch(`/api/roadmaps/${expandedRoadmap.slug}`);
        if (!roadmapResponse.ok) {
          throw new Error('Failed to fetch roadmap graph');
        }

        const roadmapResult = await roadmapResponse.json();
        const roadmapPayload = roadmapResult?.data ?? roadmapResult;
        const nodes = Array.isArray(roadmapPayload?.nodes) ? roadmapPayload.nodes : [];
        const edges = Array.isArray(roadmapPayload?.edges) ? roadmapPayload.edges : [];
        const seededInfoBlocks = Array.isArray(roadmapPayload?.infoBlocks)
          ? normalizeInfoBlocks(roadmapPayload.infoBlocks as InfoBlock[])
          : [];

        setGraphData({ nodes, edges, infoBlocks: seededInfoBlocks });
        setInfoBlocks(seededInfoBlocks);

        // Progress from node status (if available), fallback to local storage
        const statusCompleted = nodes.filter((n: any) => n?.status === 'completed').length;
        if (statusCompleted > 0) {
          setCompletedCount(statusCompleted);
        } else {
          const progressByNodeId = JSON.parse(localStorage.getItem('roadmapProgress') || '{}') as Record<string, string>;
          const localCompleted = nodes.filter((node: RoadmapNode) => progressByNodeId[node.id] === 'completed').length;
          setCompletedCount(localCompleted);
        }
        setTotalCount(nodes.length);

        // Then fetch AI-generated metadata
        const metadataResponse = await fetch('/api/gemini/generate-roadmap-info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roadmapTitle: roadmapPayload?.name || expandedRoadmap.name,
            roadmapType: expandedRoadmap.slug,
          }),
        });

        const metadataResult = await metadataResponse.json();

        if (metadataResult?.success && metadataResult?.data) {
          const aiRelatedTracks = Array.isArray(metadataResult.data.relatedTracks)
            ? metadataResult.data.relatedTracks.filter((track: unknown): track is string => typeof track === 'string')
            : [];

          const aiPrerequisites =
            Array.isArray(metadataResult.data.prerequisites) || typeof metadataResult.data.prerequisites === 'string'
              ? metadataResult.data.prerequisites
              : 'None';

          setRoadmapDescription(metadataResult.data.description || 'Comprehensive learning roadmap.');
          setRelatedTracks(aiRelatedTracks);
          setTargetAudience(metadataResult.data.targetAudience || 'Beginners and professionals');
          setEstimatedTime(metadataResult.data.estimatedTime || '3-6 months');
          setPrerequisites(aiPrerequisites);
        } else {
          setRoadmapDescription(roadmapPayload?.description || 'Comprehensive learning roadmap.');
          setRelatedTracks([]);
          setTargetAudience('Beginners and professionals');
          setEstimatedTime('3-6 months');
          setPrerequisites('None');
        }
      } catch (error) {
        console.error('Error fetching roadmap data:', error);
        setGraphData(null);
        setCompletedCount(0);
        setTotalCount(0);
        setRoadmapDescription('Comprehensive learning roadmap.');
        setRelatedTracks([]);
        setTargetAudience('Beginners and professionals');
        setEstimatedTime('3-6 months');
        setPrerequisites('None');
      } finally {
        setLoading(false);
        setIsLoadingInfo(false);
      }
    };

    void fetchRoadmapMetadata();
  }, [expandedRoadmap]);

  useEffect(() => {
    const roadmapTitle = expandedRoadmap?.name || '';
    const roadmapId = expandedRoadmap?.slug || '';

    if (!graphData?.nodes?.length || !roadmapTitle || !roadmapId) {
      setInfoBlocks([]);
      setIsLoadingInfoBlocks(false);
      return;
    }

    const generateInfoBlocks = async () => {
      setIsLoadingInfoBlocks(true);
      try {
        const response = await fetch('/api/gemini/generate-info-blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            roadmapTitle,
            roadmapNodes: graphData.nodes,
          }),
        });

        const result = await response.json();
        if (!result?.success || !Array.isArray(result?.data?.infoBlocks)) {
          return;
        }

        const topicToNodeId = new Map<string, string>();
        graphData.nodes.forEach((n) => {
          topicToNodeId.set(n.name.toLowerCase(), n.id);
          topicToNodeId.set(n.slug.toLowerCase(), n.id);
          topicToNodeId.set(n.id.toLowerCase(), n.id);
        });

        const positionedBlocks: InfoBlock[] = result.data.infoBlocks.map((block: any, index: number) => {
          const defaultX = index % 2 === 0 ? 100 : 520;
          const defaultY = 150 + (index * 180);
          const hasPosition = typeof block?.position?.x === 'number' && typeof block?.position?.y === 'number';
          const hasWidth = typeof block?.width === 'number';

          const relatedTopics = Array.isArray(block.relatedTopics) ? block.relatedTopics : [];
          const linkedNodes = relatedTopics
            .map((topic: string) => topicToNodeId.get(String(topic).toLowerCase()))
            .filter((id: string | undefined): id is string => Boolean(id));

          const normalizedType: InfoBlock['type'] =
            block.type === 'tip' || block.type === 'warning' || block.type === 'info' || block.type === 'recommendation'
              ? block.type
              : 'info';

          return {
            id: block.id || `info-${index + 1}`,
            text: String(block.text || '').slice(0, 220),
            position: hasPosition ? block.position : { x: defaultX, y: defaultY },
            width: hasWidth ? block.width : index % 2 === 0 ? 260 : 240,
            type: normalizedType,
            linkedNodes,
          };
        });

        // Overlay AI blocks when available; keep seeded blocks as default baseline.
        setInfoBlocks(
          positionedBlocks.length > 0
            ? normalizeInfoBlocks(positionedBlocks)
            : normalizeInfoBlocks(graphData.infoBlocks || [])
        );
      } catch (error) {
        console.error('Failed to fetch info blocks:', error);
        // Preserve seeded blocks if AI generation fails.
        setInfoBlocks(normalizeInfoBlocks(graphData.infoBlocks || []));
      } finally {
        setIsLoadingInfoBlocks(false);
      }
    };

    void generateInfoBlocks();
  }, [graphData?.nodes, graphData?.infoBlocks, expandedRoadmap?.name, expandedRoadmap?.slug]);

  // Filter roadmaps by search
  const filteredRoadmaps = roadmaps.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  if (expandedRoadmap) {
    const roadmapTitle = expandedRoadmap.name;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
      <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">
        <header className="bg-gray-900 text-white py-4 px-6 sticky top-0 z-40">
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <button
              onClick={handleExpandedBack}
              className="flex items-center gap-2 text-gray-300 hover:text-white transition"
            >
              <span>←</span>
              <span>Back</span>
            </button>
            <h1 className="text-2xl font-bold">{roadmapTitle}</h1>
            <div className="w-20" />
          </div>
        </header>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700" />
              <span className="ml-3 text-gray-600">Loading roadmap...</span>
            </div>
          ) : graphData ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
              <aside className="lg:col-span-3 space-y-4 lg:space-y-6">
                <div className="bg-white border-2 border-gray-200 rounded-lg p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-1 h-20 bg-blue-500 rounded-full flex-shrink-0" />
                    <h2 className="text-3xl font-bold text-gray-900 leading-tight">{roadmapTitle}</h2>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 space-y-4">
                  {isLoadingInfo ? (
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-5/6 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {roadmapDescription}
                    </p>
                  )}

                  <div>
                    <p className="text-sm text-gray-600 mb-3">
                      If you are already a {roadmapTitle.toLowerCase()} you should visit the following tracks:
                    </p>
                    {isLoadingInfo ? (
                      <div className="animate-pulse space-y-2">
                        <div className="h-7 bg-gray-200 rounded w-28" />
                        <div className="h-7 bg-gray-200 rounded w-36" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {relatedTracks.map((track) => (
                          <button
                            key={track}
                            onClick={() => void handleRelatedTrackClick(track)}
                            className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 rounded text-sm text-gray-800 transition"
                          >
                            {track}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-700">
                    <strong className="text-gray-900">Target audience:</strong> {targetAudience}
                  </div>

                  <div className="text-sm text-gray-700">
                    <strong className="text-gray-900">Estimated time:</strong> {estimatedTime}
                  </div>

                  <div className="text-sm text-gray-700">
                    <strong className="text-gray-900">Prerequisites:</strong>{' '}
                    {Array.isArray(prerequisites)
                      ? prerequisites.length > 0
                        ? prerequisites.join(', ')
                        : 'None'
                      : prerequisites || 'None'}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-400 border-2 border-black rounded flex-shrink-0" />
                      <span className="text-sm text-gray-700">Key topics to learn</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 border-2 border-black rounded flex-shrink-0" />
                      <span className="text-sm text-gray-700">Project ideas and suggestions</span>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="lg:col-span-9 min-w-0 space-y-4 lg:space-y-6 order-first lg:order-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <p className="text-sm text-gray-700 mb-3">
                      Find the detailed version of this roadmap along with other similar roadmaps
                    </p>
                    <a
                      href="https://roadmap.sh"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-lg p-3 text-center font-medium text-gray-800 transition"
                    >
                      roadmap.sh
                    </a>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <h3 className="font-bold text-gray-900 mb-3">Your Progress</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{completedCount} / {totalCount} completed</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
                  {isLoadingInfoBlocks && (
                    <div className="mb-3 text-xs text-gray-500">Generating AI info blocks...</div>
                  )}
                  <RoadmapFlowchart
                    roadmap={{
                      nodes: graphData.nodes,
                      edges: graphData.edges,
                      infoBlocks,
                    }}
                    roadmapId={expandedRoadmap.slug}
                  />
                </div>

                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-3xl" role="img" aria-label="AI assistant">🤖</span>
                    <h3 className="font-bold text-gray-900">AI Study Assistant</h3>
                  </div>
                  <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                    Get personalized study plans, quizzes, and resource recommendations powered by AI.
                  </p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition">
                    Open AI Tutor
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Database className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p>No graph data available for this roadmap yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Top Nav */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold mb-2">Explore Roadmaps</h1>
        <div className="flex items-center gap-4">
          {!expandedRoadmap && (
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title..."
              className="px-4 py-2 rounded-lg border border-border bg-background text-base w-64 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          )}
          {expandedRoadmap && (
            <button
              className="px-4 py-2 rounded bg-primary text-white font-medium shadow hover:bg-primary/90 transition"
              onClick={handleBack}
            >
              Back
            </button>
          )}
        </div>
      </div>

      {loadingRoadmaps ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted-foreground text-lg">Loading roadmaps...</span>
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          <Card className="p-12 text-center max-w-md mx-auto">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No roadmaps found</h3>
            <p className="text-muted-foreground">
              {search ? 'Try a different search term.' : 'Roadmaps will appear here once they are added.'}
            </p>
          </Card>
        ) : (
        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-6xl">
            {filteredRoadmaps.map((roadmap) => (
              <Card
                key={roadmap.id}
                className="flex flex-col items-center justify-between h-[400px] w-full max-w-[400px] mx-auto rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.04)] shadow-none cursor-pointer transition-all duration-200 hover:shadow-lg"
                onClick={() => handleRoadmapClick(roadmap)}
              >
                {/* Icon at top */}
                <div className="flex flex-col items-center mt-8">
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-4xl mb-4 bg-[rgba(0,0,0,0.3)]"
                    style={{ backgroundColor: `${roadmap.color}20` }}
                  >
                    {roadmap.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold text-center mb-2">{roadmap.name}</CardTitle>
                  <p className="text-base text-muted-foreground text-center whitespace-pre-line mb-2">
                    {roadmap.description}
                  </p>
                </div>
                {/* Badge at bottom */}
                <div className="flex flex-col items-center mb-6 mt-auto">
                  {roadmap.nodeCount > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-2 px-6 py-2 rounded-full text-base font-medium">
                      <Layers className="h-5 w-5" />
                      {roadmap.nodeCount} topics
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {roadmaps.length === 0 && (
        <Card className="p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No roadmaps available</h3>
          <p className="text-muted-foreground">
            Roadmaps will appear here once they are added to the system.
          </p>
        </Card>
      )}
    </div>
  );
}

export default ExplorePage;
