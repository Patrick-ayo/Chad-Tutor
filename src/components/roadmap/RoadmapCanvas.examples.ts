/**
 * RoadmapCanvas Usage Examples
 * 
 * Shows how to structure roadmap data with the new connection line styles
 */

// Example 1: Basic roadmap with solid and optional connections
const exampleRoadmap1 = {
  nodes: [
    {
      id: 'javascript',
      title: 'JavaScript Fundamentals',
      position: { x: 100, y: 100 },
      width: 160,
      height: 50,
      type: 'topic',
      status: 'completed',
      connectedTo: ['typescript', 'react'],  // Both required paths
      optionalConnections: [],  // None optional
      description: 'Core JavaScript concepts and ES6+',
    },
    {
      id: 'typescript',
      title: 'TypeScript',
      position: { x: 100, y: 200 },
      width: 160,
      height: 50,
      type: 'topic',
      status: 'in-progress',
      connectedTo: ['react'],
      connectedFrom: ['javascript'],
      description: 'Static typing for JavaScript',
    },
    {
      id: 'react',
      title: 'React',
      position: { x: 400, y: 150 },  // Far from JavaScript
      width: 160,
      height: 50,
      type: 'topic',
      status: 'pending',
      connectedTo: ['nextjs', 'testing'],
      connectedFrom: ['javascript', 'typescript'],
      description: 'React library for UI development',
    },
    {
      id: 'nextjs',
      title: 'Next.js',
      position: { x: 600, y: 100 },
      width: 160,
      height: 50,
      type: 'checkpoint',  // Dark gray node
      status: 'pending',
      connectedTo: [],
      connectedFrom: ['react'],
      description: 'Full-stack React framework',
    },
    {
      id: 'testing',
      title: 'Jest & Testing',
      position: { x: 600, y: 250 },
      width: 160,
      height: 50,
      type: 'topic',
      status: 'pending',
      connectedTo: [],
      connectedFrom: ['react'],
      description: 'Unit testing and testing libraries',
    },
  ],
  infoBlocks: [
    {
      id: 'tip-1',
      type: 'tip',
      text: '💡 Learn TypeScript after mastering JavaScript for better type safety.',
      position: { x: 50, y: 300 },
      width: 250,
    },
    {
      id: 'warning-1',
      type: 'warning',
      text: '⚠️ React is a library, not a framework. Use Next.js for full-stack apps.',
      position: { x: 450, y: 350 },
      width: 250,
    },
  ],
};

// Example 2: Complex roadmap with optional paths
const exampleRoadmap2 = {
  nodes: [
    {
      id: 'python-basics',
      title: 'Python Basics',
      position: { x: 100, y: 50 },
      width: 180,
      height: 50,
      status: 'completed',
      connectedTo: ['data-structures', 'oop', 'django'],
      optionalConnections: ['django'],  // Django is optional path
      description: 'Python fundamentals and syntax',
    },
    {
      id: 'data-structures',
      title: 'Data Structures',
      position: { x: 100, y: 180 },
      width: 180,
      height: 50,
      status: 'in-progress',
      connectedTo: ['algorithms', 'django-models'],
      optionalConnections: [],
      description: 'Lists, dicts, sets, and algorithms',
    },
    {
      id: 'oop',
      title: 'Object Oriented Programming',
      position: { x: 350, y: 100 },
      width: 180,
      height: 50,
      status: 'pending',
      connectedTo: ['design-patterns'],
      optionalConnections: [],
      description: 'Classes, inheritance, polymorphism',
    },
    {
      id: 'algorithms',
      title: 'Algorithms & Complexity',
      position: { x: 350, y: 250 },
      width: 180,
      height: 50,
      status: 'pending',
      connectedTo: ['system-design'],
      optionalConnections: [],
      description: 'Time/space complexity, sorting, searching',
    },
    {
      id: 'design-patterns',
      title: 'Design Patterns',
      position: { x: 600, y: 150 },
      width: 180,
      height: 50,
      type: 'checkpoint',
      status: 'pending',
      connectedTo: ['system-design'],
      optionalConnections: [],
      description: 'Common design patterns and practices',
    },
    {
      id: 'django',
      title: 'Django Framework',
      position: { x: 100, y: 350 },
      width: 180,
      height: 50,
      status: 'pending',
      connectedTo: ['django-models', 'django-rest'],
      optionalConnections: [],
      description: 'Django web framework for Python',
    },
    {
      id: 'django-models',
      title: 'Django Models & DB',
      position: { x: 350, y: 380 },
      width: 180,
      height: 50,
      status: 'pending',
      connectedTo: ['django-rest'],
      connectedFrom: ['django', 'data-structures'],
      description: 'Database models and ORM',
    },
    {
      id: 'django-rest',
      title: 'Django REST API',
      position: { x: 600, y: 350 },
      width: 180,
      height: 50,
      status: 'pending',
      connectedTo: [],
      connectedFrom: ['django', 'django-models'],
      description: 'Building RESTful APIs with Django',
    },
    {
      id: 'system-design',
      title: 'System Design',
      position: { x: 800, y: 200 },
      width: 180,
      height: 50,
      type: 'checkpoint',
      status: 'pending',
      connectedTo: [],
      connectedFrom: ['algorithms', 'design-patterns'],
      description: 'Scalable system architecture and design',
    },
  ],
  infoBlocks: [
    {
      id: 'info-optional-path',
      type: 'info',
      text: 'ℹ️ Django is optional - you can focus on pure Python fundamentals instead.',
      position: { x: 50, y: 420 },
      width: 280,
    },
    {
      id: 'recommendation-1',
      type: 'recommendation',
      text: '⭐ Recommended: Master algorithms before system design.',
      position: { x: 700, y: 450 },
      width: 280,
    },
  ],
};

// Example 3: How connection lines render
const connectionBehavior = {
  solidBlueLines: {
    distance: 'Any distance',
    type: 'Required paths (connectedTo)',
    color: '#3b82f6',
    style: 'Solid or curved based on distance',
    example: 'JavaScript → React (required)',
  },
  dottedGrayLines: {
    distance: 'Any distance',
    type: 'Optional paths (in optionalConnections)',
    color: '#94a3b8',
    style: 'Solid or curved, dashed 6,6 pattern',
    example: 'JavaScript → TypeScript (optional)',
  },
  straightLines: {
    distance: '≤ 200px horizontal difference',
    type: 'Adjacent nodes',
    lineType: 'Straight line element',
    example: 'Distance 150px: rendered as SVG <line>',
  },
  curvedLines: {
    distance: '> 200px horizontal difference',
    type: 'Distant nodes',
    lineType: 'Cubic Bezier curve (SVG <path>)',
    controlPoints: 'At 20% of horizontal distance offset',
    example: 'Distance 400px: rendered as SVG <path> with smooth curve',
  },
};

/*
 * DATA STRUCTURE REFERENCE
 * 
 * RoadmapNode structure for Canvas:
 * {
 *   id: string                               // Unique node identifier
 *   title: string                            // Display name
 *   position: { x: number; y: number }       // SVG coordinates (required)
 *   width?: number                           // Default: 160
 *   height?: number                          // Default: 50
 *   type?: string                            // 'checkpoint' for dark nodes, otherwise yellow
 *   status?: 'pending' | 'in-progress' | 'completed'  // Visual indicator
 *   connectedTo?: string[]                   // Node IDs of required next steps (solid blue lines)
 *   optionalConnections?: string[]           // Node IDs within connectedTo that are optional (dotted)
 *   resources?: { free: [...], premium: [...] }
 *   description?: string
 * }
 * 
 * IMPORTANT: A connection is optional if it appears in BOTH:
 * - connectedTo array (node references)
 * - optionalConnections array (marks as optional)
 * 
 * Example:
 * {
 *   connectedTo: ['typescript', 'react'],
 *   optionalConnections: ['typescript'],  // Only typescript is optional
 * }
 * → renders solid blue line to react, dotted gray line to typescript
 */

export { exampleRoadmap1, exampleRoadmap2, connectionBehavior };
