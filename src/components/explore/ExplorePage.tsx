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
import RoadmapCanvas from '@/components/roadmap/RoadmapCanvas';
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
  status?: 'pending' | 'in-progress' | 'completed';
  resources?: {
    metadata?: {
      layout?: {
        x?: number;
        y?: number;
        width?: number;
        height?: number;
      };
    };
  };
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
  leftMaxX: 180,
  rightMinX: 760,
  rightMaxX: 840,
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
    const isLeftSide = (block.position?.x ?? 0) < 550;
    const fallbackX = index % 2 === 0 ? 100 : 800;
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

interface CanvasNode {
  id: string;
  title: string;
  name?: string;
  description?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  type?: string;
  status?: 'pending' | 'in-progress' | 'completed';
  connectedTo?: string[];
  connections?: CanvasConnection[];
  optionalConnections?: string[];
  resources?: unknown;
}

interface CanvasConnection {
  targetId: string;
  type: 'smoothstep';
  sourceHandle: 'left' | 'right';
  targetHandle: 'left' | 'right';
  style: {
    strokeDasharray: '6,4';
    stroke: '#5B9BD5';
    borderRadius: 20;
  };
}

function buildCanvasRoadmap(graph: RoadmapGraph, blocks: InfoBlock[]): { nodes: CanvasNode[]; infoBlocks: InfoBlock[] } {
  const nodes = graph.nodes ?? [];
  const edges = graph.edges ?? [];

  if (!nodes.length) {
    return { nodes: [], infoBlocks: blocks };
  }

  const childByParent = new Map<string, Set<string>>();
  const parentByChild = new Map<string, string>();

  edges.forEach((edge) => {
    if (edge.edgeType === 'SUBSKILL_OF') {
      // Graph stores child -> parent for hierarchy; canvas expects parent -> child.
      if (!childByParent.has(edge.targetId)) {
        childByParent.set(edge.targetId, new Set<string>());
      }
      childByParent.get(edge.targetId)?.add(edge.sourceId);
      parentByChild.set(edge.sourceId, edge.targetId);
      return;
    }
  });

  const sortedNodes = [...nodes].sort((a, b) => a.sortOrder - b.sortOrder);
  const rootNode = sortedNodes.find((n) => !parentByChild.has(n.id)) ?? sortedNodes[0];

  const bySortOrder = (aId: string, bId: string): number => {
    const a = nodes.find((n) => n.id === aId);
    const b = nodes.find((n) => n.id === bId);
    return (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0);
  };

  const mainPathIds = Array.from(childByParent.get(rootNode.id) ?? []).sort(bySortOrder);
  const mainPathSet = new Set(mainPathIds);
  const nodeById = new Map(nodes.map((n) => [n.id, n]));

  const SPINE_X = 550;
  const LEFT_X = 80;
  const RIGHT_X = 820;
  const ROOT_Y = 70;
  const MIN_SIBLING_GAP_Y = 80;
  const MIN_GROUP_GAP_Y = 120;
  const ROOT_TO_FIRST_GROUP_GAP_Y = 140;

  const positioned = new Map<string, { x: number; y: number }>();
  const widthById = new Map<string, number>();
  const heightById = new Map<string, number>();

  nodes.forEach((node) => {
    const layout = node.resources?.metadata?.layout;
    widthById.set(node.id, Number.isFinite(layout?.width) ? Number(layout?.width) : (node.width ?? 160));
    heightById.set(node.id, Number.isFinite(layout?.height) ? Number(layout?.height) : (node.height ?? 50));
  });

  const centeredX = (nodeId: string): number => {
    const width = widthById.get(nodeId) ?? 160;
    return Math.round(SPINE_X - width / 2);
  };

  // Root at top center.
  positioned.set(rootNode.id, { x: centeredX(rootNode.id), y: ROOT_Y });

  const getDescendants = (startId: string): string[] => {
    const collected: string[] = [];
    const stack = Array.from(childByParent.get(startId) ?? []).sort(bySortOrder).reverse();
    const seen = new Set<string>();

    while (stack.length > 0) {
      const id = stack.pop() as string;
      if (seen.has(id) || mainPathSet.has(id)) {
        continue;
      }
      seen.add(id);
      collected.push(id);

      const children = Array.from(childByParent.get(id) ?? []).sort(bySortOrder).reverse();
      children.forEach((c) => {
        if (!seen.has(c)) {
          stack.push(c);
        }
      });
    }

    return collected.sort(bySortOrder);
  };

  // Align center sections and side lanes with fixed x-columns and formula-based spacing.
  let currentMainY = ROOT_Y + ROOT_TO_FIRST_GROUP_GAP_Y;
  let sectionBottomY = ROOT_Y + (heightById.get(rootNode.id) ?? 50);
  const assignedResources = new Set<string>();

  mainPathIds.forEach((mainId, mainIndex) => {
    let mainY = mainIndex === 0 ? currentMainY : Math.max(currentMainY, sectionBottomY + MIN_GROUP_GAP_Y);
    const mainHeight = heightById.get(mainId) ?? 50;
    const mainCenterY = () => mainY + mainHeight / 2;
    const descendants = getDescendants(mainId).filter((id) => !assignedResources.has(id));

    const leftIds: string[] = [];
    const rightIds: string[] = [];

    descendants.forEach((id) => {
      const layoutX = nodeById.get(id)?.resources?.metadata?.layout?.x;
      if (typeof layoutX === 'number') {
        if (layoutX < SPINE_X) {
          leftIds.push(id);
        } else {
          rightIds.push(id);
        }
      } else if (leftIds.length <= rightIds.length) {
        leftIds.push(id);
      } else {
        rightIds.push(id);
      }
    });

    const laneSize = (laneIds: string[]) => {
      const laneNodeHeight = laneIds.length > 0
        ? Math.max(...laneIds.map((id) => heightById.get(id) ?? 50))
        : 0;
      const totalGroupHeight = laneIds.length > 0
        ? laneIds.length * laneNodeHeight + (laneIds.length - 1) * MIN_SIBLING_GAP_Y
        : 0;
      return { laneNodeHeight, totalGroupHeight };
    };

    const leftMetrics = laneSize(leftIds);
    const rightMetrics = laneSize(rightIds);
    const initialLeftTop = leftIds.length > 0 ? mainCenterY() - leftMetrics.totalGroupHeight / 2 : Number.POSITIVE_INFINITY;
    const initialRightTop = rightIds.length > 0 ? mainCenterY() - rightMetrics.totalGroupHeight / 2 : Number.POSITIVE_INFINITY;
    const initialMinChildTop = Math.min(initialLeftTop, initialRightTop);

    // Maintain minimum gap between parent groups.
    const minAllowedTop = sectionBottomY + MIN_GROUP_GAP_Y;
    if (initialMinChildTop !== Number.POSITIVE_INFINITY && initialMinChildTop < minAllowedTop) {
      mainY += minAllowedTop - initialMinChildTop;
    }

    positioned.set(mainId, { x: centeredX(mainId), y: Math.round(mainY) });

    const placeLaneByFormula = (
      laneIds: string[],
      laneX: number,
      laneNodeHeight: number,
      totalGroupHeight: number
    ) => {
      let laneBottom = Math.round(mainY + mainHeight);
      if (!laneIds.length) {
        return laneBottom;
      }

      // Formula:
      // totalGroupHeight = (nodeCount * nodeHeight) + ((nodeCount - 1) * gap)
      // startY = parentCenterY - totalGroupHeight / 2
      // childY[i] = startY + i * (nodeHeight + gap)
      const startY = mainCenterY() - totalGroupHeight / 2;

      laneIds.forEach((id, index) => {
        const y = Math.round(startY + index * (laneNodeHeight + MIN_SIBLING_GAP_Y));
        positioned.set(id, { x: laneX, y });
        assignedResources.add(id);
        const h = heightById.get(id) ?? laneNodeHeight;
        laneBottom = Math.max(laneBottom, y + h);
      });

      return laneBottom;
    };

    const leftBottom = placeLaneByFormula(leftIds, LEFT_X, leftMetrics.laneNodeHeight, leftMetrics.totalGroupHeight);
    const rightBottom = placeLaneByFormula(rightIds, RIGHT_X, rightMetrics.laneNodeHeight, rightMetrics.totalGroupHeight);

    // Recenter parent vertically between first/last child bounds without moving children.
    const allChildren = [...leftIds, ...rightIds];
    if (allChildren.length > 0) {
      const topMostChild = Math.min(
        ...allChildren.map((id) => {
          const p = positioned.get(id) as { x: number; y: number };
          return p.y;
        })
      );
      const bottomMostChild = Math.max(
        ...allChildren.map((id) => {
          const p = positioned.get(id) as { x: number; y: number };
          const h = heightById.get(id) ?? 50;
          return p.y + h;
        })
      );
      const centeredParentY = (topMostChild + bottomMostChild) / 2 - mainHeight / 2;
      mainY = Math.round(centeredParentY);
      positioned.set(mainId, { x: centeredX(mainId), y: mainY });
    }

    sectionBottomY = Math.max(sectionBottomY, Math.round(mainY + mainHeight), leftBottom, rightBottom);
    currentMainY = sectionBottomY + MIN_GROUP_GAP_Y;
  });

  // Any remaining nodes (deeper hierarchy) get stacked beneath their parent on the same side.
  const unresolved = sortedNodes.filter((n) => !positioned.has(n.id) && n.id !== rootNode.id);
  unresolved.forEach((node, index) => {
    const nodeHeight = heightById.get(node.id) ?? 50;
    const rowGap = nodeHeight + MIN_SIBLING_GAP_Y;
    // Final fallback keeps map readable and avoids overlap.
    positioned.set(node.id, {
      x: index % 2 === 0 ? LEFT_X : RIGHT_X,
      y: Math.round(sectionBottomY + MIN_GROUP_GAP_Y + index * rowGap),
    });
  });

  const connectedById = new Map<string, Set<string>>();
  const connectionMetaBySource = new Map<string, CanvasConnection[]>();

  const addConnection = (from: string, to: string) => {
    if (!connectedById.has(from)) {
      connectedById.set(from, new Set<string>());
    }

    const existingTargets = connectedById.get(from) as Set<string>;
    if (existingTargets.has(to)) {
      return;
    }
    existingTargets.add(to);

    const fromPos = positioned.get(from) ?? { x: centeredX(from), y: ROOT_Y };
    const toPos = positioned.get(to) ?? { x: centeredX(to), y: ROOT_Y };
    const sourceOnLeft = fromPos.x < toPos.x;
    const connection: CanvasConnection = {
      targetId: to,
      type: 'smoothstep',
      sourceHandle: sourceOnLeft ? 'right' : 'left',
      targetHandle: sourceOnLeft ? 'left' : 'right',
      style: {
        strokeDasharray: '6,4',
        stroke: '#5B9BD5',
        borderRadius: 20,
      },
    };

    if (!connectionMetaBySource.has(from)) {
      connectionMetaBySource.set(from, []);
    }
    connectionMetaBySource.get(from)?.push(connection);
  };

  // Vertical center sequence: child -> parent chain.
  if (mainPathIds.length > 0) {
    addConnection(mainPathIds[0], rootNode.id);
    for (let i = 0; i < mainPathIds.length - 1; i += 1) {
      addConnection(mainPathIds[i + 1], mainPathIds[i]);
    }
  }

  // Branch connections: child -> center milestone.
  mainPathIds.forEach((mainId) => {
    const branchIds = getDescendants(mainId);
    branchIds.forEach((branchId) => addConnection(branchId, mainId));
  });

  // Detect orphan nodes (non-backbone nodes with no outgoing rendered edge)
  // and auto-connect them to the nearest backbone parent by vertical proximity.
  const backboneNodeIds = new Set<string>([rootNode.id, ...mainPathIds]);
  const renderedEdges: Array<{ source: string; target: string }> = [];
  connectedById.forEach((targets, source) => {
    targets.forEach((target) => renderedEdges.push({ source, target }));
  });

  const connectedSources = new Set(renderedEdges.map((e) => e.source));
  const orphanNodes = sortedNodes.filter((n) => !backboneNodeIds.has(n.id) && !connectedSources.has(n.id));

  if (orphanNodes.length > 0) {
    console.log('Orphan nodes with no connections:', orphanNodes.map((n) => ({ id: n.id, name: n.name })));

    const parentCandidates = mainPathIds.length > 0 ? mainPathIds : [rootNode.id];
    const nearestBackboneParent = (nodeId: string): string => {
      const nodePos = positioned.get(nodeId) ?? { x: centeredX(nodeId), y: ROOT_Y };
      const nodeHeight = heightById.get(nodeId) ?? 50;
      const nodeCenterY = nodePos.y + nodeHeight / 2;

      let bestParentId = parentCandidates[0];
      let bestDistance = Number.POSITIVE_INFINITY;

      parentCandidates.forEach((parentId) => {
        const parentPos = positioned.get(parentId) ?? { x: centeredX(parentId), y: ROOT_Y };
        const parentHeight = heightById.get(parentId) ?? 50;
        const parentCenterY = parentPos.y + parentHeight / 2;
        const distance = Math.abs(parentCenterY - nodeCenterY);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestParentId = parentId;
        }
      });

      return bestParentId;
    };

    orphanNodes.forEach((orphan) => {
      const inferredParent = nearestBackboneParent(orphan.id);
      addConnection(orphan.id, inferredParent);
    });
  }

  const canvasNodes: CanvasNode[] = sortedNodes.map((node) => {
    const p = positioned.get(node.id) ?? { x: centeredX(node.id), y: ROOT_Y };
    const layout = node.resources?.metadata?.layout;

    return {
      id: node.id,
      title: node.name,
      name: node.name,
      description: node.description,
      position: p,
      width: Number.isFinite(layout?.width) ? Number(layout?.width) : node.width,
      height: Number.isFinite(layout?.height) ? Number(layout?.height) : node.height,
      type: node.type,
      status: node.status,
      connectedTo: Array.from(connectedById.get(node.id) ?? []),
      connections: connectionMetaBySource.get(node.id) ?? [],
      resources: node.resources,
    };
  });

  return {
    nodes: canvasNodes,
    infoBlocks: blocks,
  };
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

interface CanvasClickNode {
  id: string;
  title?: string;
  name?: string;
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
  const [activeTopicTitle, setActiveTopicTitle] = useState<string>('');
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
    setActiveTopicTitle('');
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

  const handleCanvasNodeClick = (node: CanvasClickNode) => {
    const topic = (node?.title || node?.name || '').trim();
    setActiveTopicTitle(topic);
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
        // Normalize any legacy edge types labelled 'straight' to 'smoothstep'
        const normalizedEdges = edges.map((e: any) => ({
          ...e,
          edgeType: e?.edgeType === 'straight' ? 'smoothstep' : e?.edgeType,
        }));
        const seededInfoBlocks = Array.isArray(roadmapPayload?.infoBlocks)
          ? normalizeInfoBlocks(roadmapPayload.infoBlocks as InfoBlock[])
          : [];

        setGraphData({ nodes, edges: normalizedEdges, infoBlocks: seededInfoBlocks });
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
          const defaultX = index % 2 === 0 ? 100 : 800;
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
    const relatedTopicLabel = (activeTopicTitle || roadmapTitle).toLowerCase();
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
                      If you are already familiar with {relatedTopicLabel}, you should visit the following related tracks:
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
                  <RoadmapCanvas
                    roadmap={buildCanvasRoadmap(graphData, infoBlocks)}
                    roadmapId={expandedRoadmap.slug}
                    onNodeClick={handleCanvasNodeClick}
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
