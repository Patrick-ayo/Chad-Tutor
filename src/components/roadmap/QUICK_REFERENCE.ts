/**
 * QUICK REFERENCE: RoadmapCanvas Connection Styles
 * 
 * For developers integrating the RoadmapCanvas component
 */

// ============================================================================
// CONNECTION TYPES AT A GLANCE
// ============================================================================

// SOLID BLUE LINE - Required step
const requiredConnection = {
  title: "Required Connection",
  distance: "Any",
  color: "#3b82f6",
  style: "Solid or curved",
  code: `connectedTo: ['react']`
};

// DOTTED GRAY LINE - Optional step
const optionalConnection = {
  title: "Optional Connection",
  distance: "Any",
  color: "#94a3b8",
  style: "Dotted (6,6) solid or curved",
  code: `connectedTo: ['typescript'], optionalConnections: ['typescript']`
};

// STRAIGHT LINE - Adjacent nodes
const straightLine = {
  title: "Straight Line",
  distance: ">= 200px",
  rendering: "SVG <line>",
  efficiency: "High",
  example: "Node A to Node B (150px apart)"
};

// CURVED LINE - Distant nodes
const curvedLine = {
  title: "Curved Line",
  distance: "> 200px",
  rendering: "SVG <path> with cubic Bezier",
  efficiency: "Medium",
  example: "Node A to Node B (300px+ apart)"
};

// ============================================================================
// MINIMAL WORKING EXAMPLE
// ============================================================================

const minimalExample = `
import RoadmapCanvas from '@/components/roadmap/RoadmapCanvas';

function MyComponent() {
  const roadmap = {
    nodes: [
      {
        id: 'js',
        title: 'JavaScript',
        position: { x: 100, y: 100 },
        connectedTo: ['react', 'typescript'],
        optionalConnections: ['typescript'],  // Make TypeScript optional
      },
      {
        id: 'react',
        title: 'React',
        position: { x: 300, y: 100 },
        connectedTo: [],
      },
      {
        id: 'typescript',
        title: 'TypeScript',
        position: { x: 300, y: 250 },
        connectedTo: [],
      },
    ],
  };

  return (
    <RoadmapCanvas 
      roadmap={roadmap}
      roadmapId="web-dev"
      onNodeClick={(node) => console.log('Clicked:', node)}
    />
  );
}
`;

// ============================================================================
// DECISION TREE: Which connection to use?
// ============================================================================

const decisionTree = `
┌─────────────────────────────────────┐
│     Is this step required?          │
└──────────┬──────────────────────────┘
           │
      YES  │  NO
           │
      ┌────┴───┐
      │        │
   [ADD TO     [ADD TO BOTH
   connectedTo connectedTo AND
   ONLY]       optionalConnections]
      │        │
      ▼        ▼
   SOLID     DOTTED
   BLUE      GRAY
   LINE      LINE (6,6)
`;

// ============================================================================
// IMPORTANT ALGORITHM DETAILS
// ============================================================================

const algorithmDetails = {
  lineSelection: `
    Horizontal Distance = |node.x - target.x|
    
    IF distance <= 200px:
      → Render as straight <line> for efficiency
    
    ELSE (distance > 200px):
      → Render as curved <path>
      → Use cubic Bezier curve
      → Control point offset = max(50, distance * 0.2)
      → Creates smooth, professional appearance
  `,
  
  connectionStyling: `
    IF node is in BOTH connectedTo AND optionalConnections:
      → Use dotted gray (#94a3b8)
      → Dash pattern: "6,6" (6px on, 6px off)
      → Opacity: 0.7
      → Arrow: gray marker
    
    ELSE IF node is in connectedTo only:
      → Use solid blue (#3b82f6)
      → No dashes (stroke-dasharray: "0")
      → Opacity: 1.0
      → Arrow: blue marker
  `,
};

// ============================================================================
// COMMON PATTERNS
// ============================================================================

const commonPatterns = {
  linearPath: `
    // Simple learning path: no branches
    {
      connectedTo: ['step2'],
      optionalConnections: []
    } → {
      connectedTo: ['step3'],
      optionalConnections: []
    } → {
      connectedTo: [],
      optionalConnections: []
    }
  `,
  
  withAlternatives: `
    // Branching with alternatives
    {
      id: 'basics',
      connectedTo: ['frontend', 'backend'],  // Both paths exist
      optionalConnections: []                 // Both required
    }
    // Creates 2 solid blue lines branching from "basics"
  `,
  
  optionalBranch: `
    // Main path with optional side path
    {
      id: 'javascript',
      connectedTo: ['typescript', 'react'],
      optionalConnections: ['typescript']  // Optional learning
    }
    // Creates:
    // - Solid blue to React (main path)
    // - Dotted gray to TypeScript (optional)
  `,
  
  mixed: `
    // Multiple required + multiple optional
    {
      id: 'skills',
      connectedTo: ['req1', 'req2', 'opt1', 'opt2'],
      optionalConnections: ['opt1', 'opt2']
    }
    // Creates:
    // - Solid blue → req1
    // - Solid blue → req2
    // - Dotted gray → opt1
    // - Dotted gray → opt2
  `,
};

// ============================================================================
// TESTING CHECKLIST
// ============================================================================

const testingChecklist = `
☐ Verify straight lines render for adjacent nodes
☐ Verify curved lines render for distant nodes (200px+)
☐ Verify solid blue for required connections
☐ Verify dotted gray (6,6) for optional connections
☐ Verify arrow markers match line color
☐ Verify drop shadows render correctly
☐ Verify node clicks work (sidebar opens)
☐ Verify hover effects on nodes and connections
☐ Verify responsive SVG scaling on different screen sizes
☐ Verify info blocks render and position correctly
☐ Test with 50+ nodes for performance
☐ Test on mobile devices for touch interaction
`;

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

const performanceTips = `
1. LIMIT NODES
   - 50-100 nodes: smooth, no issues
   - 100-200 nodes: may need optimization
   - 200+ nodes: consider pagination or lazy rendering

2. OPTIMIZE RENDERING
   - Ensure pointer-events: none on paths (CSS)
   - Use keys consistently in map(...)
   - Avoid re-renders by memoizing roadmap data

3. CURVE CALCULATIONS
   - Curves only for distance > 200px (threshold)
   - Most connections are straight lines by default
   - This keeps SVG DOM size reasonable

4. BROWSER DEVTOOLS
   - Inspect SVG elements in Elements panel
   - Check Styles panel for CSS inheritance
   - Use Performance tab to measure render time
`;

// ============================================================================
// TROUBLESHOOTING
// ============================================================================

const troubleshooting = {
  problem: "Lines not rendering",
  solutions: [
    "Check connectedTo array has valid node IDs",
    "Verify target nodes exist in nodes array",
    "Ensure position.x and position.y are numbers",
  ],
};

const problem2 = {
  problem: "Lines look ugly/weird",
  solutions: [
    "Check horizontal distance (> 200px uses curve)",
    "Verify control point offset calculation",
    "Try adjusting the 200px or 0.2 multiplier thresholds",
  ],
};

const problem3 = {
  problem: "Can't click optional connections",
  solutions: [
    "pointer-events: none is intentional (paths not clickable)",
    "Click nodes instead (they're interactive)",
    "To make lines clickable, remove pointer-events: none from CSS",
  ],
};

// ============================================================================
// EXPORTS (for reference)
// ============================================================================

export {
  requiredConnection,
  optionalConnection,
  straightLine,
  curvedLine,
  minimalExample,
  decisionTree,
  algorithmDetails,
  commonPatterns,
  testingChecklist,
  performanceTips,
  troubleshooting,
  problem2,
  problem3,
};
