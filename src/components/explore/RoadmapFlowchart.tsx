/**
 * RoadmapFlowchart Component
 * 
 * Renders a roadmap with a central vertical spine and branches extending left/right.
 * Similar to roadmap.sh visual style.
 */

import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import RoadmapSidebar from '@/components/roadmap/RoadmapSidebar';

type NodeStatus = 'pending' | 'in-progress' | 'completed';

interface RoadmapNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  difficulty: string;
  sortOrder: number;
  resources?: {
    free: Array<{
      type: 'article' | 'video' | 'course';
      title: string;
      url: string;
    }>;
    premium: Array<{
      type: 'article' | 'video' | 'course';
      title: string;
      url: string;
      discount?: string;
    }>;
  };
  status?: NodeStatus;
}

interface RoadmapEdge {
  sourceId: string;
  targetId: string;
  edgeType: string;
}

interface RoadmapFlowchartProps {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  roadmapId: string;
}

interface TreeNode extends RoadmapNode {
  children: TreeNode[];
  depth: number;
}

interface SelectedNodeData {
  id: string;
  title: string;
  description: string;
  resources?: RoadmapNode['resources'];
}

const difficultyColors: Record<string, { bg: string; border: string; text: string }> = {
  BEGINNER: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  INTERMEDIATE: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-400' },
  ADVANCED: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
  EXPERT: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400' },
};

const statusBorderColor: Record<NodeStatus, string> = {
  pending: '#d97706',
  'in-progress': '#3b82f6',
  completed: '#10b981',
};

function getNodeStatus(node: RoadmapNode): NodeStatus {
  return node.status ?? 'pending';
}

function CompletedBadge() {
  return (
    <span className="pointer-events-none absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] text-sm font-bold text-white shadow-md">
      ✓
    </span>
  );
}

export function RoadmapFlowchart({ nodes, edges, roadmapId }: RoadmapFlowchartProps) {
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [progressByNodeId, setProgressByNodeId] = useState<Record<string, NodeStatus>>({});

  useEffect(() => {
    console.log('Roadmap data on mount/update:', {
      roadmapId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes,
      edges,
    });
  }, [nodes, edges, roadmapId]);

  useEffect(() => {
    const storedProgress = localStorage.getItem('roadmapProgress');
    if (!storedProgress) return;

    try {
      const parsed = JSON.parse(storedProgress) as Record<string, NodeStatus>;
      setProgressByNodeId(parsed);
    } catch {
      setProgressByNodeId({});
    }
  }, []);

  const updateProgress = (nodeId: string, status: NodeStatus) => {
    const progress = JSON.parse(localStorage.getItem('roadmapProgress') || '{}') as Record<string, NodeStatus>;
    progress[nodeId] = status;
    localStorage.setItem('roadmapProgress', JSON.stringify(progress));
    setProgressByNodeId(progress);
  };

  const handleNodeClick = (nodeData: SelectedNodeData) => {
    const currentStatus = progressByNodeId[nodeData.id] ?? 'pending';
    if (currentStatus === 'pending') {
      updateProgress(nodeData.id, 'in-progress');
    }

    setSelectedNode(nodeData);
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedNode(null), 300);
  };

  // Build tree structure from nodes and edges
  const { root, mainPath } = useMemo(() => {
    if (!nodes.length) return { root: null, mainPath: [] };

    const nodeMap = new Map<string, TreeNode>();
    const childToParent = new Map<string, string>();

    // Initialize nodes
    nodes.forEach((node) => {
      nodeMap.set(node.id, {
        ...node,
        status: progressByNodeId[node.id] ?? node.status ?? 'pending',
        children: [],
        depth: 0,
      });
    });

    // Build parent-child relationships from SUBSKILL_OF edges
    edges.forEach((edge) => {
      if (edge.edgeType === 'SUBSKILL_OF') {
        childToParent.set(edge.sourceId, edge.targetId);
      }
    });

    // Find root nodes
    const rootIds: string[] = [];
    nodeMap.forEach((_, id) => {
      if (!childToParent.has(id)) {
        rootIds.push(id);
      }
    });

    // Attach children to parents
    childToParent.forEach((parentId, childId) => {
      const parent = nodeMap.get(parentId);
      const child = nodeMap.get(childId);
      if (parent && child) {
        parent.children.push(child);
      }
    });

    // Sort children by sortOrder
    nodeMap.forEach((node) => {
      node.children.sort((a, b) => a.sortOrder - b.sortOrder);
    });

    // Get the root (first one, should be the main roadmap root)
    const rootNode = rootIds.length > 0 ? nodeMap.get(rootIds[0])! : null;
    
    // The main path are the direct children of root (top-level sections)
    const mainPathNodes = rootNode ? rootNode.children : [];

    return { root: rootNode, mainPath: mainPathNodes };
  }, [nodes, edges, progressByNodeId]);

  if (!root) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No roadmap structure to display.
      </div>
    );
  }

  return (
    <div className="roadmap-flowchart w-full py-8">
      {/* Root Title */}
      <div className="flex justify-center mb-8">
        <div className="px-8 py-4 rounded-xl bg-primary/20 border-2 border-primary text-primary font-bold text-xl">
          {root.name}
        </div>
      </div>

      {/* Central Spine with Branches */}
      <div className="relative">
        {/* Central vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

        {/* Main sections */}
        <div className="flex flex-col gap-0">
          {mainPath.map((section, index) => (
            <MainSection
              key={section.id}
              section={section}
              index={index}
              isLast={index === mainPath.length - 1}
              onNodeClick={handleNodeClick}
            />
          ))}
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[999]"
          onClick={handleCloseSidebar}
        />
      )}

      <RoadmapSidebar
        node={selectedNode}
        roadmapId={roadmapId}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
    </div>
  );
}

interface MainSectionProps {
  section: TreeNode;
  index: number;
  isLast: boolean;
  onNodeClick: (nodeData: SelectedNodeData) => void;
}

function MainSection({ section, onNodeClick }: MainSectionProps) {
  const hasChildren = section.children.length > 0;
  const colors = difficultyColors[section.difficulty] || difficultyColors.BEGINNER;
  const status = getNodeStatus(section);
  
  // Split children into left and right groups
  const leftChildren: TreeNode[] = [];
  const rightChildren: TreeNode[] = [];
  
  section.children.forEach((child, i) => {
    if (i % 2 === 0) {
      leftChildren.push(child);
    } else {
      rightChildren.push(child);
    }
  });

  // Determine which side gets more items for better balance
  const maxSideItems = Math.max(leftChildren.length, rightChildren.length);

  return (
    <div className="relative">
      {/* Section node on center spine */}
      <div className="flex justify-center relative z-10">
        <div
          className={cn(
            'relative px-6 py-3 rounded-lg border-2 font-semibold text-base transition-all hover:scale-105 cursor-pointer hover:opacity-80 transition-opacity',
            colors.bg,
            colors.border,
            colors.text
          )}
          style={{
            borderColor: statusBorderColor[status],
            filter:
              status === 'in-progress'
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                : undefined,
          }}
          onClick={() => {
            console.log('Node clicked:', {
              id: section.id,
              title: section.name,
              description: section.description,
              resources: section.resources,
              fullNode: section,
            });
            onNodeClick({
              id: section.id,
              title: section.name,
              description: section.description || 'No description available for this topic.',
              resources: section.resources,
            });
          }}
        >
          {section.name}
          {status === 'completed' && <CompletedBadge />}
        </div>
      </div>

      {/* Branches - Left and Right */}
      {hasChildren && (
        <div className="relative mt-4 mb-8">
          {/* Grid for left and right branches */}
          <div className="grid grid-cols-2 gap-0">
            {/* Left side branches */}
            <div className="flex flex-col items-end pr-8 gap-3">
              {leftChildren.map((child, i) => (
                <BranchNode
                  key={child.id}
                  node={child}
                  side="left"
                  index={i}
                  totalOnSide={leftChildren.length}
                  maxSideItems={maxSideItems}
                  onNodeClick={onNodeClick}
                />
              ))}
            </div>

            {/* Right side branches */}
            <div className="flex flex-col items-start pl-8 gap-3">
              {rightChildren.map((child, i) => (
                <BranchNode
                  key={child.id}
                  node={child}
                  side="right"
                  index={i}
                  totalOnSide={rightChildren.length}
                  maxSideItems={maxSideItems}
                  onNodeClick={onNodeClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Spacer between sections */}
      <div className="h-6" />
    </div>
  );
}

interface BranchNodeProps {
  node: TreeNode;
  side: 'left' | 'right';
  index: number;
  totalOnSide: number;
  maxSideItems: number;
  onNodeClick: (nodeData: SelectedNodeData) => void;
}

function BranchNode({ node, side, onNodeClick }: BranchNodeProps) {
  const hasChildren = node.children.length > 0;
  const colors = difficultyColors[node.difficulty] || difficultyColors.BEGINNER;
  const status = getNodeStatus(node);

  return (
    <div className={cn('relative flex items-center', side === 'left' ? 'flex-row-reverse' : 'flex-row')}>
      {/* Horizontal connector line to center */}
      <div
        className={cn(
          'w-8 h-0.5 bg-border',
          side === 'left' ? 'ml-0' : 'mr-0'
        )}
      />

      {/* Node content */}
      <div className="flex flex-col gap-2">
        {/* Main node box */}
        <div
          className={cn(
            'relative px-4 py-2 rounded-md border text-sm font-medium transition-all hover:scale-105 cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap',
            colors.bg,
            colors.border,
            colors.text
          )}
          style={{
            borderColor: statusBorderColor[status],
            filter:
              status === 'in-progress'
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                : undefined,
          }}
          onClick={() => {
            console.log('Node clicked:', {
              id: node.id,
              title: node.name,
              description: node.description,
              resources: node.resources,
              fullNode: node,
            });
            onNodeClick({
              id: node.id,
              title: node.name,
              description: node.description || 'No description available for this topic.',
              resources: node.resources,
            });
          }}
        >
          {node.name}
          {status === 'completed' && <CompletedBadge />}
        </div>

        {/* Sub-children (leaf nodes) */}
        {hasChildren && (
          <div className={cn('flex flex-col gap-1.5', side === 'left' ? 'items-end' : 'items-start')}>
            {node.children.map((leaf) => (
              <LeafNode key={leaf.id} node={leaf} side={side} onNodeClick={onNodeClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface LeafNodeProps {
  node: TreeNode;
  side: 'left' | 'right';
  onNodeClick: (nodeData: SelectedNodeData) => void;
}

function LeafNode({ node, side, onNodeClick }: LeafNodeProps) {
  const colors = difficultyColors[node.difficulty] || difficultyColors.BEGINNER;
  const hasChildren = node.children.length > 0;
  const status = getNodeStatus(node);

  return (
    <div className={cn('flex flex-col gap-1', side === 'left' ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'relative px-3 py-1.5 rounded border text-xs transition-all hover:scale-105 cursor-pointer hover:opacity-80 transition-opacity',
          colors.bg,
          colors.border,
          colors.text,
          'opacity-80 hover:opacity-100'
        )}
        style={{
          borderColor: statusBorderColor[status],
          filter:
            status === 'in-progress'
              ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
              : undefined,
        }}
        onClick={() => {
          console.log('Node clicked:', {
            id: node.id,
            title: node.name,
            description: node.description,
            resources: node.resources,
            fullNode: node,
          });
          onNodeClick({
            id: node.id,
            title: node.name,
            description: node.description || 'No description available for this topic.',
            resources: node.resources,
          });
        }}
      >
        {node.name}
        {status === 'completed' && <CompletedBadge />}
      </div>

      {/* Deep children (4th level) */}
      {hasChildren && (
        <div className={cn('flex flex-wrap gap-1 max-w-xs', side === 'left' ? 'justify-end' : 'justify-start')}>
          {node.children.map((deepChild) => (
            (() => {
              const deepStatus = getNodeStatus(deepChild);
              return (
            <div
              key={deepChild.id}
              className="relative px-2 py-1 rounded text-xs bg-muted/50 border border-border/30 text-muted-foreground hover:bg-muted cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                borderColor: statusBorderColor[deepStatus],
                filter:
                  deepStatus === 'in-progress'
                    ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                    : undefined,
              }}
              onClick={() => {
                console.log('Node clicked:', {
                  id: deepChild.id,
                  title: deepChild.name,
                  description: deepChild.description,
                  resources: deepChild.resources,
                  fullNode: deepChild,
                });
                onNodeClick({
                  id: deepChild.id,
                  title: deepChild.name,
                  description: deepChild.description || 'No description available for this topic.',
                  resources: deepChild.resources,
                });
              }}
            >
              {deepChild.name}
              {deepStatus === 'completed' && <CompletedBadge />}
            </div>
              );
            })()
          ))}
        </div>
      )}
    </div>
  );
}

export default RoadmapFlowchart;
