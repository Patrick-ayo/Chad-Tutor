/**
 * Roadmap conversion utilities for adapting tree-based structures to Canvas format
 * 
 * Use these functions to convert from the existing tree-based RoadmapFlowchart format
 * to the new SVG Canvas format that matches roadmap.sh exactly.
 */

interface TreeNode {
  id: string;
  name: string;
  description?: string;
  children: TreeNode[];
  depth: number;
  resources?: any;
  status?: 'pending' | 'in-progress' | 'completed';
  type?: string;
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
  optionalConnections?: string[];
  resources?: any;
}

export interface CanvasRoadmap {
  nodes: CanvasNode[];
  infoBlocks?: any[];
}

/**
 * Convert tree-based roadmap structure to Canvas format
 * 
 * This uses a layered horizontal layout similar to roadmap.sh
 */
export function convertTreeToCanvas(
  root: TreeNode | null,
  mainPath: TreeNode[],
  infoBlocks?: any[]
): CanvasRoadmap {
  if (!root) {
    return { nodes: [], infoBlocks };
  }

  const canvasNodes: CanvasNode[] = [];
  const nodePositions = new Map<string, { x: number; y: number }>();

  // Constants for layout
  const LANE_WIDTH = 200;
  const LAYER_HEIGHT = 120;
  const START_X = 100;
  const START_Y = 60;

  // Helper to calculate position for a node in the tree
  const calculatePosition = (node: TreeNode, layer: number, indexInLayer: number, totalInLayer: number) => {
    const x = START_X + layer * LANE_WIDTH;
    const totalHeight = totalInLayer * LAYER_HEIGHT;
    const y = START_Y + (indexInLayer * LAYER_HEIGHT) + (1100 - totalHeight) / 2;

    return { x, y };
  };

  // Create position map for all nodes
  const visitNode = (node: TreeNode, layer: number, indexInLayer: number, totalInLayer: number, parent?: TreeNode) => {
    const position = calculatePosition(node, layer, indexInLayer, totalInLayer);
    nodePositions.set(node.id, position);

    // Process children
    node.children.forEach((child, idx) => {
      visitNode(child, layer + 1, idx, node.children.length, node);
    });
  };

  // Visit all nodes starting from root
  visitNode(root, 0, 0, 1);

  // Flatten tree to canvas nodes and build connections
  const visited = new Set<string>();

  const flattenTree = (node: TreeNode): CanvasNode => {
    if (visited.has(node.id)) {
      return {} as CanvasNode;
    }
    visited.add(node.id);

    const position = nodePositions.get(node.id) || { x: 0, y: 0 };
    const connectedTo = node.children.map(child => child.id);

    return {
      id: node.id,
      title: node.name,
      name: node.name,
      description: node.description,
      position,
      width: 160,
      height: 50,
      type: node.type,
      status: node.status,
      connectedTo: connectedTo.length > 0 ? connectedTo : undefined,
      resources: node.resources,
    };
  };

  // Add root
  if (root) {
    canvasNodes.push(flattenTree(root));
  }

  // Add all nodes in main path and their descendants
  const addNodeAndChildren = (node: TreeNode) => {
    canvasNodes.push(flattenTree(node));
    node.children.forEach(addNodeAndChildren);
  };

  mainPath.forEach(addNodeAndChildren);

  return {
    nodes: canvasNodes,
    infoBlocks,
  };
}

/**
 * Alternative: Convert with custom positioning algorithm
 * Useful if you want to specify exact node positions
 */
export function convertTreeToCanvasCustom(
  nodes: any[],
  edges: any[],
  infoBlocks?: any[],
  positionMap?: Map<string, { x: number; y: number }>
): CanvasRoadmap {
  const canvasNodes: CanvasNode[] = nodes.map(node => {
    const position = positionMap?.get(node.id) || { x: 100, y: 100 };
    
    // Find connected nodes
    const connectedTo = edges
      .filter(edge => edge.sourceId === node.id && edge.edgeType !== 'SUBSKILL_OF')
      .map(edge => edge.targetId);

    return {
      id: node.id,
      title: node.name,
      name: node.name,
      description: node.description,
      position,
      width: node.width || 160,
      height: node.height || 50,
      type: node.type,
      status: node.status,
      connectedTo: connectedTo.length > 0 ? connectedTo : undefined,
      resources: node.resources,
    };
  });

  return {
    nodes: canvasNodes,
    infoBlocks,
  };
}

/**
 * Validate canvas roadmap structure
 */
export function validateCanvasRoadmap(roadmap: any): boolean {
  if (!roadmap || !Array.isArray(roadmap.nodes)) {
    console.error('Invalid roadmap: missing nodes array');
    return false;
  }

  for (const node of roadmap.nodes) {
    if (!node.id || !node.title || !node.position) {
      console.error('Invalid node:', node);
      return false;
    }

    if (typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
      console.error('Invalid position:', node.position);
      return false;
    }
  }

  return true;
}
