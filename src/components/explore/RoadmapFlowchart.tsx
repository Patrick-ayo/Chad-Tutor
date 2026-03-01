/**
 * RoadmapFlowchart Component
 * 
 * Renders a roadmap with a central vertical spine and branches extending left/right.
 * Similar to roadmap.sh visual style.
 */

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface RoadmapNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  difficulty: string;
  sortOrder: number;
}

interface RoadmapEdge {
  sourceId: string;
  targetId: string;
  edgeType: string;
}

interface RoadmapFlowchartProps {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

interface TreeNode extends RoadmapNode {
  children: TreeNode[];
  depth: number;
}

const difficultyColors: Record<string, { bg: string; border: string; text: string }> = {
  BEGINNER: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  INTERMEDIATE: { bg: 'bg-amber-500/10', border: 'border-amber-500/50', text: 'text-amber-400' },
  ADVANCED: { bg: 'bg-orange-500/10', border: 'border-orange-500/50', text: 'text-orange-400' },
  EXPERT: { bg: 'bg-red-500/10', border: 'border-red-500/50', text: 'text-red-400' },
};

export function RoadmapFlowchart({ nodes, edges }: RoadmapFlowchartProps) {
  // Build tree structure from nodes and edges
  const { root, mainPath } = useMemo(() => {
    if (!nodes.length) return { root: null, mainPath: [] };

    const nodeMap = new Map<string, TreeNode>();
    const childToParent = new Map<string, string>();

    // Initialize nodes
    nodes.forEach((node) => {
      nodeMap.set(node.id, { ...node, children: [], depth: 0 });
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
  }, [nodes, edges]);

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
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface MainSectionProps {
  section: TreeNode;
  index: number;
  isLast: boolean;
}

function MainSection({ section }: MainSectionProps) {
  const hasChildren = section.children.length > 0;
  const colors = difficultyColors[section.difficulty] || difficultyColors.BEGINNER;
  
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
            'px-6 py-3 rounded-lg border-2 font-semibold text-base transition-all hover:scale-105 cursor-pointer',
            colors.bg,
            colors.border,
            colors.text
          )}
        >
          {section.name}
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
}

function BranchNode({ node, side }: BranchNodeProps) {
  const hasChildren = node.children.length > 0;
  const colors = difficultyColors[node.difficulty] || difficultyColors.BEGINNER;

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
            'px-4 py-2 rounded-md border text-sm font-medium transition-all hover:scale-105 cursor-pointer whitespace-nowrap',
            colors.bg,
            colors.border,
            colors.text
          )}
        >
          {node.name}
        </div>

        {/* Sub-children (leaf nodes) */}
        {hasChildren && (
          <div className={cn('flex flex-col gap-1.5', side === 'left' ? 'items-end' : 'items-start')}>
            {node.children.map((leaf) => (
              <LeafNode key={leaf.id} node={leaf} side={side} />
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
}

function LeafNode({ node, side }: LeafNodeProps) {
  const colors = difficultyColors[node.difficulty] || difficultyColors.BEGINNER;
  const hasChildren = node.children.length > 0;

  return (
    <div className={cn('flex flex-col gap-1', side === 'left' ? 'items-end' : 'items-start')}>
      <div
        className={cn(
          'px-3 py-1.5 rounded border text-xs transition-all hover:scale-105 cursor-pointer',
          colors.bg,
          colors.border,
          colors.text,
          'opacity-80 hover:opacity-100'
        )}
      >
        {node.name}
      </div>

      {/* Deep children (4th level) */}
      {hasChildren && (
        <div className={cn('flex flex-wrap gap-1 max-w-xs', side === 'left' ? 'justify-end' : 'justify-start')}>
          {node.children.map((deepChild) => (
            <div
              key={deepChild.id}
              className="px-2 py-1 rounded text-xs bg-muted/50 border border-border/30 text-muted-foreground hover:bg-muted cursor-pointer"
            >
              {deepChild.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RoadmapFlowchart;
