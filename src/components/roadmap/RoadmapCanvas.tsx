/**
 * RoadmapCanvas Component - roadmap.sh exact styling with theme support
 * 
 * Pure SVG-based canvas rendering with:
 * - Yellow nodes (#fef08a) with black borders (light mode)
 * - Brighter yellow nodes for dark mode
 * - Dark gray checkpoints (#1f2937)
 * - Blue connection lines (#3b82f6)
 * - Rounded corners and drop shadows
 * - Completion checkmarks and in-progress indicators
 */

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import RoadmapSidebar from '@/components/roadmap/RoadmapSidebar';
import './RoadmapCanvas.css';

type NodeStatus = 'pending' | 'in-progress' | 'completed';

type HandleId = 'left' | 'right' | 'top' | 'bottom';

interface RoadmapConnection {
  targetId: string;
  type?: 'smoothstep' | string;
  sourceHandle?: 'left' | 'right';
  targetHandle?: 'left' | 'right';
  style?: {
    strokeDasharray?: string;
    stroke?: string;
    borderRadius?: number;
  };
}

interface RoadmapNode {
  id: string;
  title: string;
  name?: string;
  description?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  type?: string;
  status?: NodeStatus;
  connectedTo?: string[];
  connections?: RoadmapConnection[];
  optionalConnections?: string[];
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
}

interface InfoBlock {
  id: string;
  text: string;
  position: { x: number; y: number };
  width: number;
  type: 'tip' | 'warning' | 'info' | 'recommendation';
  linkedNodes?: string[];
}

interface RoadmapCanvasProps {
  roadmap: {
    nodes: RoadmapNode[];
    infoBlocks?: InfoBlock[];
  };
  roadmapId: string;
  onNodeClick?: (node: RoadmapNode) => void;
}

interface SelectedNodeData {
  id: string;
  title: string;
  description: string;
  resources?: RoadmapNode['resources'];
}

/**
 * Get exact roadmap.sh styling for nodes based on type and theme
 */
const getThemeColors = (theme: 'light' | 'dark') => {
  return {
    light: {
      background: '#ffffff',
      nodeFill: '#fef08a',  // Yellow
      checkpointFill: '#1f2937',  // Dark gray
      nodeBorder: '#000000',
      nodeText: '#000000',
      checkpointText: '#ffffff',
      connectionLine: '#3b82f6',  // Blue
      spine: '#3b82f6',
      infoBlocks: {
        tip: { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6' },
        warning: { bg: '#fef3c7', text: '#92400e', border: '#f59e0b' },
        info: { bg: '#e0f2fe', text: '#075985', border: '#0ea5e9' },
        recommendation: { bg: '#f3e8ff', text: '#6b21a8', border: '#a855f7' }
      }
    },
    dark: {
      background: '#0f172a',  // Dark blue-gray
      nodeFill: '#fbbf24',  // Brighter yellow for dark mode
      checkpointFill: '#1e293b',  // Slightly lighter dark gray
      nodeBorder: '#94a3b8',  // Lighter border for visibility
      nodeText: '#0f172a',  // Dark text on yellow
      checkpointText: '#f1f5f9',  // Light text on dark
      connectionLine: '#60a5fa',  // Lighter blue for dark mode
      spine: '#60a5fa',
      infoBlocks: {
        tip: { bg: '#1e3a8a', text: '#bfdbfe', border: '#3b82f6' },
        warning: { bg: '#78350f', text: '#fef3c7', border: '#f59e0b' },
        info: { bg: '#0c4a6e', text: '#bae6fd', border: '#0ea5e9' },
        recommendation: { bg: '#581c87', text: '#f3e8ff', border: '#a855f7' }
      }
    }
  }[theme];
};

const getNodeStyle = (node: RoadmapNode, theme: 'light' | 'dark') => {
  const colors = getThemeColors(theme);
  const isCheckpoint = node.type === 'checkpoint' || /checkpoint|project|milestone|capstone/i.test(node.title);
  
  return {
    fill: isCheckpoint ? colors.checkpointFill : colors.nodeFill,
    stroke: colors.nodeBorder,
    strokeWidth: 2.5,  // Thick border like roadmap.sh
    textColor: isCheckpoint ? colors.checkpointText : colors.nodeText,
    rx: 6  // Rounded corners
  };
};

const RoadmapCanvas = ({ roadmap, roadmapId, onNodeClick }: RoadmapCanvasProps) => {
  const { theme } = useTheme();
  const infoBlocks = roadmap?.infoBlocks || [];
  const nodes = roadmap?.nodes || [];
  const colors = getThemeColors(theme);

  const estimateTextLines = (text: string, width: number) => {
    const safeText = (text || '').trim();
    if (!safeText) return 1;
    const charsPerLine = Math.max(12, Math.floor((width - 22) / 7));
    const words = safeText.split(/\s+/);
    let lines = 1;
    let currentLen = 0;

    for (const word of words) {
      const nextLen = currentLen === 0 ? word.length : currentLen + 1 + word.length;
      if (nextLen > charsPerLine) {
        lines += 1;
        currentLen = word.length;
      } else {
        currentLen = nextLen;
      }
    }

    return Math.min(lines, 4);
  };

  const getNodeDimensions = (node: RoadmapNode) => {
    const width = node.width || 160;
    const baseHeight = node.height || 50;
    const lines = estimateTextLines(node.title || node.name || '', width);
    const contentHeight = 18 + lines * 16;
    return {
      width,
      height: Math.max(baseHeight, contentHeight),
    };
  };

  const getViewBoxHeight = () => {
    let maxY = 1300;

    nodes.forEach((node) => {
      const dims = getNodeDimensions(node);
      maxY = Math.max(maxY, node.position.y + dims.height + 120);
    });

    infoBlocks.forEach((block) => {
      maxY = Math.max(maxY, block.position.y + 220);
    });

    return Math.max(1400, Math.ceil(maxY));
  };

  const viewBoxHeight = getViewBoxHeight();
  
  const [selectedNode, setSelectedNode] = useState<SelectedNodeData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleNodeClick = (node: RoadmapNode) => {
    const nodeData: SelectedNodeData = {
      id: node.id,
      title: node.title || node.name || '',
      description: node.description || 'No description available for this topic.',
      resources: node.resources,
    };
    
    setSelectedNode(nodeData);
    setIsSidebarOpen(true);
    onNodeClick?.(node);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setTimeout(() => setSelectedNode(null), 300);
  };

  /**
   * Render connections as controlled, gentle curves.
   * - Keep center-lane links vertical on the backbone.
   * - Keep side links on their side to avoid crossing the backbone.
   * - Use short bezier control offsets to avoid S-curves/loops.
   */
  const renderConnection = (node: RoadmapNode, edgeRef: string | RoadmapConnection) => {
    const targetId = typeof edgeRef === 'string' ? edgeRef : edgeRef.targetId;
    const target = nodes.find(n => n.id === targetId);
    if (!target) return null;

    const nodeDims = getNodeDimensions(node);
    const targetDims = getNodeDimensions(target);
    const nodeWidth = nodeDims.width;
    const nodeHeight = nodeDims.height;
    const targetWidth = targetDims.width;
    const targetHeight = targetDims.height;

    const SPINE_X = 550;
    const nodeCenterX = node.position.x + nodeWidth / 2;
    const nodeCenterY = node.position.y + nodeHeight / 2;
    const targetCenterX = target.position.x + targetWidth / 2;
    const targetCenterY = target.position.y + targetHeight / 2;

    const edgeType = typeof edgeRef === 'string' ? 'smoothstep' : (edgeRef.type ?? 'smoothstep');
    const edgeDash = typeof edgeRef === 'string' ? '6,4' : (edgeRef.style?.strokeDasharray ?? '6,4');
    const edgeStroke = typeof edgeRef === 'string' ? colors.connectionLine : (edgeRef.style?.stroke ?? colors.connectionLine);
    const borderRadius = typeof edgeRef === 'string' ? 20 : (edgeRef.style?.borderRadius ?? 20);
    const isNearSpine = (x: number) => Math.abs(x - SPINE_X) <= 42;
    const nodeOnSpine = isNearSpine(nodeCenterX);
    const targetOnSpine = isNearSpine(targetCenterX);

    // Keep center-lane relations strictly vertical to prevent backbone wraps.
    if (nodeOnSpine && targetOnSpine) {
      const topNode = nodeCenterY <= targetCenterY ? node : target;
      const bottomNode = nodeCenterY <= targetCenterY ? target : node;
      const topDims = nodeCenterY <= targetCenterY ? nodeDims : targetDims;

      const startY = topNode.position.y + topDims.height;
      const endY = bottomNode.position.y;

      return (
        <line
          key={`${node.id}-${targetId}`}
          x1={SPINE_X}
          y1={Math.round(startY)}
          x2={SPINE_X}
          y2={Math.round(endY)}
          stroke={edgeStroke}
          strokeWidth="3"
          strokeDasharray={edgeDash}
          strokeLinecap="round"
          className="connection-path connection-center-vertical"
        />
      );
    }

    // Determine side so side-links never cross the backbone.
    let side: 'left' | 'right';
    if (nodeOnSpine && !targetOnSpine) {
      side = targetCenterX < SPINE_X ? 'left' : 'right';
    } else if (!nodeOnSpine && targetOnSpine) {
      side = nodeCenterX < SPINE_X ? 'left' : 'right';
    } else {
      side = (nodeCenterX + targetCenterX) / 2 < SPINE_X ? 'left' : 'right';
    }

    // Required edge directionality:
    // left child: parent.left -> child.right
    // right child: parent.right -> child.left
    const sideForNode: 'left' | 'right' = typeof edgeRef === 'string'
      ? side
      : (edgeRef.sourceHandle ?? side);
    const sideForTarget: 'left' | 'right' = typeof edgeRef === 'string'
      ? (side === 'left' ? 'right' : 'left')
      : (edgeRef.targetHandle ?? (side === 'left' ? 'right' : 'left'));

    const edgePoint = (
      pos: { x: number; y: number },
      w: number,
      h: number,
      edge: HandleId
    ) => {
      if (edge === 'top') {
        return { x: pos.x + w / 2, y: pos.y };
      }
      if (edge === 'bottom') {
        return { x: pos.x + w / 2, y: pos.y + h };
      }
      return {
        x: edge === 'left' ? pos.x : pos.x + w,
        y: pos.y + h / 2,
      };
    };

    let start = edgePoint(node.position, nodeWidth, nodeHeight, sideForNode);
    let end = edgePoint(target.position, targetWidth, targetHeight, sideForTarget);

    // Guardrail: keep side links outside the backbone by nudging anchors.
    if (side === 'left') {
      start = { ...start, x: Math.min(start.x, SPINE_X - 8) };
      end = { ...end, x: Math.min(end.x, SPINE_X - 8) };
    } else {
      start = { ...start, x: Math.max(start.x, SPINE_X + 8) };
      end = { ...end, x: Math.max(end.x, SPINE_X + 8) };
    }

    const dx = end.x - start.x;
    const direction = dx >= 0 ? 1 : -1;
    const controlOffset = Math.max(40, Math.min(80, borderRadius * 3));
    const c1x = start.x + direction * controlOffset;
    const c1y = start.y;
    const c2x = end.x - direction * controlOffset;
    const c2y = end.y;

    if (edgeType !== 'smoothstep') {
      return (
        <line
          key={`${node.id}-${targetId}`}
          x1={Math.round(start.x)}
          y1={Math.round(start.y)}
          x2={Math.round(end.x)}
          y2={Math.round(end.y)}
          stroke={edgeStroke}
          strokeWidth="3"
          strokeDasharray={edgeDash}
          strokeLinecap="round"
          className="connection-path connection-straight"
        />
      );
    }

    return (
      <path
        key={`${node.id}-${targetId}`}
        d={`M ${Math.round(start.x)} ${Math.round(start.y)} C ${Math.round(c1x)} ${Math.round(c1y)}, ${Math.round(c2x)} ${Math.round(c2y)}, ${Math.round(end.x)} ${Math.round(end.y)}`}
        stroke={edgeStroke}
        strokeWidth="3"
        strokeDasharray={edgeDash}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="connection-path connection-gentle-curve"
      />
    );
  };

  /**
   * Determine if a node is a parent/main node for visual hierarchy
   * Parent nodes display in bold, child nodes in normal weight
   */
  const isParentNode = (node: RoadmapNode): boolean => {
    // Parent nodes are:
    // 1. Section/topic nodes (type === 'topic' or 'section')
    // 2. Nodes with children (has items in connectedTo array)
    // 3. Checkpoint nodes (type === 'checkpoint')
    // 4. Nodes with "main" or "section" in their ID
    return (
      node.type === 'topic' ||
      node.type === 'section' ||
      node.type === 'checkpoint' ||
      (node.connectedTo && node.connectedTo.length > 0) ||
      node.id.includes('main') ||
      node.id.includes('section')
    );
  };

  return (
    <div className="w-full" style={{ backgroundColor: colors.background }}>
      <svg
        width="100%"
        height="700"
        viewBox={`0 0 1100 ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        }}
      >
        <defs>
          {/* Arrow marker - roadmap.sh style */}
          <marker
            id="arrowhead"
            markerWidth="12"
            markerHeight="12"
            refX="11"
            refY="6"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path
              d="M 0 0 L 12 6 L 0 12 z"
              fill={colors.connectionLine}
            />
          </marker>
          
          {/* Dotted arrow for optional paths */}
          <marker
            id="arrowhead-dotted"
            markerWidth="12"
            markerHeight="12"
            refX="11"
            refY="6"
            orient="auto"
          >
            <path
              d="M 0 0 L 12 6 L 0 12 z"
              fill={colors.connectionLine}
            />
          </marker>
          
          {/* Gradient for central spine fade effect */}
          <linearGradient
            id="spineGradient"
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" style={{ stopColor: colors.spine, stopOpacity: 0.3 }} />
            <stop offset="50%" style={{ stopColor: colors.spine, stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: colors.spine, stopOpacity: 0.3 }} />
          </linearGradient>
        </defs>

        {/* Central vertical spine - roadmap.sh signature style */}
        <line
          x1="550"
          y1="80"
          x2="550"
          y2={viewBoxHeight - 70}
          stroke="url(#spineGradient)"
          strokeWidth="4"
          strokeLinecap="round"
          className="roadmap-spine"
        />

        {/* Connection lines with multiple styles - roadmap.sh style */}
        {nodes.map(node => {
          if (node.connections && node.connections.length > 0) {
            return node.connections.map((edge) => renderConnection(node, edge));
          }
          return node.connectedTo?.map(targetId => renderConnection(node, targetId));
        })}

        {/* Nodes - roadmap.sh exact style */}
        {nodes.map(node => {
          const style = getNodeStyle(node, theme);
          const nodeDims = getNodeDimensions(node);
          const nodeWidth = nodeDims.width;
          const nodeHeight = nodeDims.height;
          
          return (
            <g
              key={node.id}
              transform={`translate(${node.position.x}, ${node.position.y})`}
              onClick={() => handleNodeClick(node)}
              className="roadmap-node cursor-pointer transition-all duration-200"
              style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.12))' }}
            >
              {/* Node background with roadmap.sh styling */}
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx={style.rx}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={style.strokeWidth}
                className="transition-all duration-200"
                style={{
                  filter: node.status === 'completed' ? 'brightness(0.95)' : 'none'
                }}
              />
              
              {/* Hover effect - subtle border glow */}
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx={style.rx}
                fill="none"
                stroke={colors.connectionLine}
                strokeWidth="0"
                className="hover-border transition-all duration-200"
                style={{ pointerEvents: 'none' }}
              />
              
              {/* Node text - roadmap.sh typography with hierarchy styling */}
              <foreignObject
                x="0"
                y="0"
                width={nodeWidth}
                height={nodeHeight}
              >
                {(() => {
                  const isParent = isParentNode(node);
                  return (
                    <div
                      className="flex items-center justify-center h-full px-3 text-center"
                      style={{
                        fontSize: isParent ? '14px' : '13px',  // Parent slightly larger
                        fontWeight: isParent ? 600 : 400,  // Parent bold (600), child normal (400)
                        color: style.textColor,
                        lineHeight: '1.25',
                        letterSpacing: '-0.015em',
                        wordSpacing: '0.05em',
                        overflow: 'hidden',
                        wordBreak: 'break-word',
                        hyphens: 'auto',
                      }}
                    >
                      {node.title || node.name}
                    </div>
                  );
                })()}
              </foreignObject>
              
              {/* Completion checkmark - roadmap.sh style */}
              {node.status === 'completed' && (
                <g transform={`translate(${nodeWidth - 18}, 8)`}>
                  <circle
                    r="10"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="2"
                  />
                  <path
                    d="M -3 0 L -1 3 L 4 -3"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </g>
              )}
              
              {/* In-progress indicator */}
              {node.status === 'in-progress' && (
                <g transform={`translate(${nodeWidth - 18}, 8)`}>
                  <circle
                    r="10"
                    fill="none"
                    stroke={colors.connectionLine}
                    strokeWidth="2"
                  />
                  <circle
                    r="4"
                    fill={colors.connectionLine}
                  />
                </g>
              )}
            </g>
          );
        })}

        {/* Info blocks - roadmap.sh style */}
        {infoBlocks.map((block, index) => {
          const blockStyle = colors.infoBlocks[block.type] || colors.infoBlocks.info;
          
          return (
            <foreignObject
              key={`info-${index}`}
              x={block.position.x}
              y={block.position.y}
              width={block.width}
              height="auto"
            >
              <div
                className="rounded-md p-3 info-block"
                style={{
                  backgroundColor: blockStyle.bg,
                  color: blockStyle.text,
                  fontSize: '13px',
                  lineHeight: '1.5',
                  fontWeight: 400,
                  letterSpacing: '-0.01em',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                  border: `1.5px solid ${blockStyle.border}20`,
                }}
              >
                {block.text}
              </div>
            </foreignObject>
          );
        })}
      </svg>

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
};

export default RoadmapCanvas;
