/**
 * RoadmapFlowchart Component
 * 
 * Renders a roadmap with a central vertical spine and branches extending left/right.
 * Similar to roadmap.sh visual style.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import RoadmapSidebar from '@/components/roadmap/RoadmapSidebar';

type NodeStatus = 'pending' | 'in-progress' | 'completed';

interface RoadmapNode {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type?: string;
  difficulty: string;
  sortOrder: number;
  width?: number;
  height?: number;
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

interface InfoBlock {
  id: string;
  text: string;
  position: { x: number; y: number };
  width: number;
  type: 'tip' | 'warning' | 'info' | 'recommendation';
  linkedNodes?: string[];
}

interface RoadmapFlowchartProps {
  roadmap: {
    nodes: RoadmapNode[];
    edges: RoadmapEdge[];
    infoBlocks?: InfoBlock[];
  };
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

const INFO_BLOCK_BOUNDS = {
  leftMinX: 60,
  leftMaxX: 120,
  rightMinX: 760,
  rightMaxX: 820,
  minY: 100,
  maxY: 1800,
  minWidth: 240,
  maxWidth: 280,
} as const;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeInfoBlocks(blocks: InfoBlock[]): InfoBlock[] {
  return blocks.map((block, index) => {
    const isLeftSide = (block.position?.x ?? 0) < 550;
    const fallbackX = index % 2 === 0 ? 80 : 780;
    const rawX = Number.isFinite(block.position?.x) ? block.position.x : fallbackX;
    const rawY = Number.isFinite(block.position?.y) ? block.position.y : 150 + index * 180;
    const rawWidth = Number.isFinite(block.width) ? block.width : (isLeftSide ? 250 : 260);

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

function getNodeStatus(node: RoadmapNode): NodeStatus {
  return node.status ?? 'pending';
}

function isCheckpointNode(node: RoadmapNode): boolean {
  if (node.type === 'checkpoint') {
    return true;
  }

  return /checkpoint|project|milestone|capstone/i.test(node.name);
}

function getNodeStyle(node: RoadmapNode) {
  if (isCheckpointNode(node)) {
    return {
      fill: '#1f2937',
      stroke: '#000000',
      strokeWidth: 2,
      textColor: '#ffffff',
    };
  }

  return {
    fill: '#fef08a',
    stroke: '#000000',
    strokeWidth: 2,
    textColor: '#000000',
  };
}

function CompletedBadge() {
  return (
    <span className="pointer-events-none absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] text-sm font-bold text-white shadow-md">
      ✓
    </span>
  );
}

// Simple text wrapper for fixed-width boxes (approx 7px per char)
const wrapText = (text: string, maxWidth: number) => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * 7 > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
};

export function RoadmapFlowchart({ roadmap, roadmapId }: RoadmapFlowchartProps) {
  const VIEWBOX_PADDING = 50;
  const nodes = roadmap?.nodes ?? [];
  const edges = roadmap?.edges ?? [];
  const roadmapInfoBlocks = roadmap?.infoBlocks ?? [];
  const resolvedInfoBlocks = useMemo<InfoBlock[]>(() => normalizeInfoBlocks(roadmapInfoBlocks), [roadmapInfoBlocks]);
  const [linkLines, setLinkLines] = useState<Array<{ key: string; x1: number; y1: number; x2: number; y2: number }>>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 1100, height: 1200 });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [progressByNodeId, setProgressByNodeId] = useState<Record<string, NodeStatus>>({});

  // Runtime boundary guard so blocks stay inside the visible SVG area.
  const adjustPosition = (block: InfoBlock): InfoBlock => {
    const viewBoxWidth = 1100;
    const viewBoxHeight = Math.max(2000, canvasSize.height);
    const padding = VIEWBOX_PADDING;

    let { x, y } = block.position;
    const width = block.width || 260;
    const estimatedHeight = Math.max(100, wrapText(block.text, width - 14).length * 20 + 20);

    if (x < padding) x = padding;
    if (x + width > viewBoxWidth - padding) {
      x = viewBoxWidth - width - padding;
    }

    if (y < padding) y = padding;
    if (y + estimatedHeight > viewBoxHeight - padding) {
      y = viewBoxHeight - estimatedHeight - padding;
    }

    // If we have the DOM available, try to find free space near nodes to avoid overlap
    try {
      const container = containerRef.current;
      if (container) {
        const containerRect = container.getBoundingClientRect();

        const nodeEls = container.querySelectorAll<HTMLElement>('[id^="node-"]');
        const nodeRects: Array<{ left: number; top: number; width: number; height: number }> = [];
        nodeEls.forEach((el) => {
          const r = el.getBoundingClientRect();
          nodeRects.push({
            left: Math.max(0, r.left - containerRect.left),
            top: Math.max(0, r.top - containerRect.top),
            width: r.width,
            height: r.height,
          });
        });

        const rectIntersects = (a: { left: number; top: number; width: number; height: number }, b: { left: number; top: number; width: number; height: number }) => {
          return !(a.left + a.width < b.left || b.left + b.width < a.left || a.top + a.height < b.top || b.top + b.height < a.top);
        };

        const blockRect = { left: x, top: y, width, height: estimatedHeight };
        const overlaps = nodeRects.some((nr) => rectIntersects(blockRect, nr));

        if (overlaps) {
          // Candidate slots: left, right, between columns, top, middle, bottom
          const candidates: Array<{ x: number; y: number }> = [];
          const cw = Math.max(1100, containerRect.width || 1100);

          // top area
          [150, 200].forEach((yy) => candidates.push({ x: 80, y: yy }));
          // left column candidates
          [300, 450, 650, 900].forEach((yy) => candidates.push({ x: 80, y: yy }));
          // right column candidates
          [300, 450, 650, 900].forEach((yy) => candidates.push({ x: cw - 320, y: yy }));
          // between columns
          [400, 550, 750].forEach((yy) => candidates.push({ x: 430, y: yy }));

          const found = candidates.find((c) => {
            const r = { left: c.x, top: c.y, width, height: estimatedHeight };
            return !nodeRects.some((nr) => rectIntersects(r, nr));
          });

          if (found) {
            x = clamp(found.x, padding, viewBoxWidth - width - padding);
            y = clamp(found.y, padding, viewBoxHeight - estimatedHeight - padding);
          }
        }
      }
    } catch {
      // ignore DOM errors and fall back to clamped values
    }

    return { ...block, position: { x, y } };
  };

  const adjustedInfoBlocks = useMemo<InfoBlock[]>(
    () => resolvedInfoBlocks.map(adjustPosition),
    [resolvedInfoBlocks, canvasSize.height]
  );

  useEffect(() => {
    console.log('Roadmap data on mount/update:', {
      roadmapId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      nodes,
      edges,
    });
  }, [nodes, edges, roadmapId]);

  // Recompute link lines between infoBlocks and nodes when layout changes
  useEffect(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    const newLines: Array<{ key: string; x1: number; y1: number; x2: number; y2: number }> = [];

    const blocks = adjustedInfoBlocks;
    // simple height estimate
    blocks.forEach((block) => {
      const lines = wrapText(block.text, block.width - 14);
      const blockHeight = lines.length * 20 + 20;
      const x1 = block.position.x + block.width / 2 - containerRect.left + 0;
      const y1 = block.position.y + blockHeight / 2 - containerRect.top + 0;

      (block.linkedNodes || []).forEach((nodeId) => {
        const targetEl = document.getElementById(`node-${nodeId}`);
        if (!targetEl) return;
        const tRect = targetEl.getBoundingClientRect();
        const x2 = tRect.left - containerRect.left + tRect.width / 2;
        const y2 = tRect.top - containerRect.top + tRect.height / 2;
        newLines.push({ key: `${block.id}-${nodeId}`, x1, y1, x2, y2 });
      });
    });

    setLinkLines(newLines);

    // Compute flowchart vertical bounds. Width is intentionally constrained.
    let maxBottom = 0;

    const nodeEls = containerRef.current.querySelectorAll<HTMLElement>('[id^="node-"]');
    nodeEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      maxBottom = Math.max(maxBottom, r.bottom - containerRect.top);
    });

    blocks.forEach((block) => {
      const lines = wrapText(block.text, block.width - 14);
      const blockHeight = lines.length * 20 + 20;
      maxBottom = Math.max(maxBottom, block.position.y + blockHeight);
    });

    setCanvasSize({
      width: 1100,
      height: Math.max(900, Math.ceil(maxBottom + 80)),
    });
  }, [nodes, adjustedInfoBlocks]);

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
    <div
      ref={containerRef}
      className="roadmap-flowchart w-full bg-white relative overflow-x-hidden"
    >
      {/* Root Title */}
      <div className="flex justify-center mb-8">
        <div className="px-8 py-4 rounded-md bg-[#fef08a] border-2 border-black text-black font-bold text-xl">
          {root.name}
        </div>
      </div>

      {/* Central Spine with Branches */}
      <div className="relative mx-auto w-full" style={{ minHeight: canvasSize.height, maxWidth: canvasSize.width }}>
        {/* Central vertical line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-blue-500 -translate-x-1/2" />

        {/* SVG overlay for dotted lines between info blocks and nodes */}
        <svg
          className="absolute inset-0 pointer-events-none mx-auto"
          width="100%"
          height="700"
          viewBox="0 0 1100 1400"
          preserveAspectRatio="xMidYMid meet"
        >
          {linkLines.map((l) => (
            <line
              key={l.key}
              x1={l.x1}
              y1={l.y1}
              x2={l.x2}
              y2={l.y2}
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="5,5"
              opacity={0.6}
            />
          ))}
        </svg>

        {/* Main sections along the central spine */}
        {mainPath.map((section, index) => (
          <MainSection
            key={section.id}
            section={section}
            index={index}
            isLast={index === mainPath.length - 1}
            onNodeClick={handleNodeClick}
          />
        ))}

        {/* Info blocks rendered on top */}
        {adjustedInfoBlocks.map((block) => {
          const bgColor = {
            tip: '#dbeafe',
            warning: '#fef3c7',
            info: '#e0f2fe',
            recommendation: '#f3e8ff',
          }[block.type];

          const textColor = {
            tip: '#1e40af',
            warning: '#92400e',
            info: '#075985',
            recommendation: '#6b21a8',
          }[block.type];

          const lines = wrapText(block.text, block.width - 14);
          const blockHeight = lines.length * 20 + 20;

          return (
            <div
              key={block.id}
              style={{
                position: 'absolute',
                left: block.position.x,
                top: block.position.y,
                width: block.width,
                height: blockHeight,
                pointerEvents: 'auto',
                zIndex: 30,
              }}
            >
              <div
                className="rounded-lg p-3"
                style={{
                  backgroundColor: bgColor,
                  color: textColor,
                  fontSize: 14,
                  lineHeight: '1.4',
                  borderRadius: 8,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                {lines.map((ln, i) => (
                  <div key={i}>{ln}</div>
                ))}
              </div>
            </div>
          );
        })}
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
  const nodeStyle = getNodeStyle(section);
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

  const sectionWidth = (section as any).width || 190;
  const sectionHeight = (section as any).height || 50;
  const sectionLines = wrapText(section.name, sectionWidth - 24);
  const sectionLineHeight = 18;

  return (
    <div className="relative">
      {/* Section node on center spine */}
      <div className="flex justify-center relative z-10">
        <div
          id={`node-${section.id}`}
          className={cn(
            'relative rounded-md border-2 font-semibold text-base transition-all hover:scale-105 cursor-pointer hover:opacity-80 transition-opacity'
          )}
          style={{
            width: sectionWidth,
            minHeight: sectionHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 10px',
            backgroundColor: nodeStyle.fill,
            borderColor: nodeStyle.stroke,
            borderWidth: nodeStyle.strokeWidth,
            color: nodeStyle.textColor,
            filter:
              status === 'in-progress'
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                : undefined,
            textAlign: 'center',
            lineHeight: `${sectionLineHeight}px`,
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
          <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
            {sectionLines.map((line, idx) => (
              <div key={idx} style={{ fontSize: 15, fontWeight: 600 }}>
                {line}
              </div>
            ))}
          </div>
          {status === 'completed' && <CompletedBadge />}
        </div>
      </div>

      {/* Branches - Left and Right */}
      {hasChildren && (
        <div className="relative mt-4 mb-8">
          {/* Grid for left and right branches */}
          <div className="grid grid-cols-2 gap-0">
            {/* Left side branches */}
            <div className="flex flex-col items-end pr-4 gap-3">
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
            <div className="flex flex-col items-start pl-4 gap-3">
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
  const nodeStyle = getNodeStyle(node);
  const status = getNodeStatus(node);
  const nodeWidth = (node as any).width || 150;
  const nodeHeight = (node as any).height || 50;
  const lines = wrapText(node.name, nodeWidth - 18);
  const lineHeight = 18;

  return (
    <div className={cn('relative flex items-center', side === 'left' ? 'flex-row-reverse' : 'flex-row')}>
      {/* Horizontal connector line to center */}
      <div
        className={cn(
          'w-8 h-[3px] bg-blue-500',
          side === 'left' ? 'ml-0' : 'mr-0'
        )}
      />

      {/* Node content */}
      <div className="flex flex-col gap-2">
        {/* Main node box */}
        <div
          id={`node-${node.id}`}
          className={cn('relative rounded-md text-sm font-medium transition-all hover:scale-105 cursor-pointer hover:opacity-80 transition-opacity')}
          style={{
            width: nodeWidth,
            minHeight: nodeHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 8px',
            backgroundColor: nodeStyle.fill,
            borderColor: nodeStyle.stroke,
            borderWidth: nodeStyle.strokeWidth,
            color: nodeStyle.textColor,
            filter:
              status === 'in-progress'
                ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                : undefined,
            textAlign: 'center',
            lineHeight: `${lineHeight}px`,
            wordBreak: 'break-word',
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
          <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
            {lines.map((line, idx) => (
              <div key={idx} style={{ fontSize: 13, fontWeight: 500 }}>
                {line}
              </div>
            ))}
          </div>
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
  const nodeStyle = getNodeStyle(node);
  const hasChildren = node.children.length > 0;
  const status = getNodeStatus(node);
  const leafWidth = (node as any).width || 130;
  const leafHeight = (node as any).height || 42;
  const leafLines = wrapText(node.name, leafWidth - 12);
  const leafLineHeight = 16;

  return (
    <div className={cn('flex flex-col gap-1', side === 'left' ? 'items-end' : 'items-start')}>
      <div
        id={`node-${node.id}`}
        className={cn('relative rounded border-2 text-xs transition-all hover:scale-105 cursor-pointer hover:opacity-80 transition-opacity opacity-80 hover:opacity-100')}
        style={{
          width: leafWidth,
          minHeight: leafHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6px 8px',
          backgroundColor: nodeStyle.fill,
          borderColor: nodeStyle.stroke,
          borderWidth: nodeStyle.strokeWidth,
          color: nodeStyle.textColor,
          filter:
            status === 'in-progress'
              ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
              : undefined,
          textAlign: 'center',
          lineHeight: `${leafLineHeight}px`,
          wordBreak: 'break-word',
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
        <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
          {leafLines.map((line, idx) => (
            <div key={idx} style={{ fontSize: 12 }}>
              {line}
            </div>
          ))}
        </div>
        {status === 'completed' && <CompletedBadge />}
      </div>

      {/* Deep children (4th level) */}
      {hasChildren && (
        <div className={cn('flex flex-wrap gap-1 max-w-xs', side === 'left' ? 'justify-end' : 'justify-start')}>
            {node.children.map((deepChild) => {
            const deepStatus = getNodeStatus(deepChild);
            const deepStyle = getNodeStyle(deepChild);
            const deepWidth = (deepChild as any).width || 120;
            const deepHeight = (deepChild as any).height || 36;
            const deepLines = wrapText(deepChild.name, deepWidth - 8);
            const deepLineHeight = 14;
            return (
              <div
                key={deepChild.id}
                id={`node-${deepChild.id}`}
                className="relative rounded text-xs border-2 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  width: deepWidth,
                  minHeight: deepHeight,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px 6px',
                  backgroundColor: deepStyle.fill,
                  borderColor: deepStyle.stroke,
                  borderWidth: deepStyle.strokeWidth,
                  color: deepStyle.textColor,
                  filter:
                    deepStatus === 'in-progress'
                      ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))'
                      : undefined,
                  textAlign: 'center',
                  lineHeight: `${deepLineHeight}px`,
                  wordBreak: 'break-word',
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
                <div style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {deepLines.map((line, idx) => (
                    <div key={idx} style={{ fontSize: 12 }}>
                      {line}
                    </div>
                  ))}
                </div>
                {deepStatus === 'completed' && <CompletedBadge />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RoadmapFlowchart;
