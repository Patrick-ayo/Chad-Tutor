/**
 * ROADMAP SPINE - Central Vertical Progress Line
 * 
 * The central spine is the signature visual feature of roadmap.sh style roadmaps.
 * It provides a strong vertical anchor that guides the eye and organizes hierarchy.
 */

// ============================================================================
// SPINE FEATURES
// ============================================================================

const spineFeatures = {
  signature: "Central vertical line (x = viewBoxWidth / 2)",
  color: "Blue (#3b82f6) with gradient fade",
  width: "4px",
  style: "Rounded line caps (stroke-linecap: round)",
  gradient: "Fades in/out at top/bottom for visual polish",
  
  attributes: {
    x1: "dims.viewBoxWidth / 2",     // Dynamically centered
    y1: "80",                         // Start near top
    x2: "dims.viewBoxWidth / 2",      // Same X for vertical line
    y2: "dims.viewBoxHeight - 50",    // End near bottom
    stroke: "url(#spineGradient)",    // Gradient fill
    strokeWidth: "4",
    strokeLinecap: "round",
  },
  
  gradient: {
    type: "linearGradient",
    direction: "vertical (y1: 0% → y2: 100%)",
    stops: [
      { offset: "0%", color: "#3b82f6", opacity: 0.3 },   // Fade in
      { offset: "50%", color: "#3b82f6", opacity: 0.6 },  // Full opacity
      { offset: "100%", color: "#3b82f6", opacity: 0.3 }, // Fade out
    ],
  },
};

// ============================================================================
// VISUAL HIERARCHY - Z-INDEX STACKING
// ============================================================================

const zIndexLayers = {
  background: "0 (SVG background)",
  spine: "1 (Central vertical line)",
  connections: "2 (Curved/straight connector lines)",
  infoBlocks: "3 (Info boxes - above connections)",
  nodes: "4 (Interactive node elements - topmost)",
};

const visualHierarchy = `
FRONT (Clickable)
  ▲ 4: Nodes
  │ 3: Info blocks
  │ 2: Connection lines (pointer-events: none)
  │ 1: Central spine (pointer-events: none)
  ▼ 0: Background
BACK
`;

// ============================================================================
// CSS CLASSES
// ============================================================================

const cssClasses = {
  spine: ".roadmap-spine",
  description: "Styles for the central vertical line",
  properties: {
    pointerEvents: "none",           // Line is not interactive
    transition: "stroke-width 0.3s", // Smooth width changes
    zIndex: "1",                     // Behind nodes
  },
};

const optionalSpineAnimations = {
  hover: {
    className: ".roadmap-canvas-container:hover .roadmap-spine",
    effect: "Increases stroke-width to 6px on hover",
    opacity: 0.8,
    enabled: false,  // Commented out by default
  },
  
  pulse: {
    animationName: "spinePulse",
    duration: "8s",
    effect: "Subtle opacity pulse from 0.6 to 0.8",
    enabled: false,  // Commented out by default
  },
};

// ============================================================================
// HOW IT WORKS IN CONTEXT
// ============================================================================

const spineContext = `
1. SVG viewBox is calculated: (0, 0, viewBoxWidth, viewBoxHeight)
   
2. Diagonal calculations determine content bounds:
   - All nodes analyzed for max X and Y positions
   - Info blocks checked for positioning
   - viewBoxHeight and viewBoxWidth adjusted to fit content
   
3. Central spine positioned at viewBox center:
   - x1 and x2 = dims.viewBoxWidth / 2  (vertical line)
   - y1 = 80px (top with padding)
   - y2 = dims.viewBoxHeight - 50px (bottom with padding)
   
4. Gradient applied from SVG defs:
   - Defined once as linearGradient id="spineGradient"
   - Referenced by stroke="url(#spineGradient)"
   - Smooth fade in/out effect

5. Nodes and connections positioned relative to spine:
   - Nodes SHOULD be arranged around x = center for visual appeal
   - Left nodes typically use x < center
   - Right nodes typically use x > center
   - Main path nodes often use x ≈ center
   
6. Connection lines:
   - Straight lines for adjacent nodes
   - Curved lines for distant nodes
   - All connect to form unified hierarchy
`;

// ============================================================================
// CUSTOMIZATION OPTIONS
// ============================================================================

const customizationGuide = {
  changeSpineColor: {
    steps: [
      "1. Edit linearGradient stops in RoadmapCanvas.tsx",
      "2. Change stopColor from '#3b82f6' to desired color",
      "3. Example: '#ec4899' (pink), '#8b5cf6' (purple)",
    ],
    example: `
      <stop offset="0%" style={{ stopColor: '#ec4899', stopOpacity: 0.3 }} />
      <stop offset="50%" style={{ stopColor: '#ec4899', stopOpacity: 0.6 }} />
      <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 0.3 }} />
    `,
  },
  
  changeSpineWidth: {
    steps: [
      "1. Edit strokeWidth in spine <line> element",
      "2. Typical values: 2 (thin), 4 (default), 6 (thick)",
      "3. Update corresponding hover state if using animations",
    ],
    example: `strokeWidth="6"  // Instead of "4"`,
  },
  
  changeGradientFade: {
    steps: [
      "1. Modify offset percentages (0%, 50%, 100%)",
      "2. Adjust stopOpacity values (0.3, 0.6 defaults)",
      "3. Example: No fade - use same opacity for all stops",
    ],
    example: `
      <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
      <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
      <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.8 }} />
    `,
  },
  
  enableSpinePulse: {
    steps: [
      "1. Uncomment @keyframes spinePulse in RoadmapCanvas.css",
      "2. Uncomment animation rule for .roadmap-spine",
      "3. Spine will gently pulse from 0.6 to 0.8 opacity",
    ],
    timing: "8s ease-in-out infinite",
  },
  
  enableHoverEffect: {
    steps: [
      "1. Uncomment .roadmap-canvas-container:hover .roadmap-spine in CSS",
      "2. Spine will expand from 4px to 6px on hover",
      "3. Opacity increases from 0.6 to 0.8",
    ],
  },
};

// ============================================================================
// RECOMMENDED NODE POSITIONING
// ============================================================================

const nodePositioningForSpine = {
  mainPath: {
    description: "Sequential steps along main learning path",
    xPosition: "Centered around viewBoxWidth / 2 (±50px)",
    spacing: "Space nodes vertically (y: 100-150px apart)",
    example: `
      {
        id: 'step1',
        position: { x: 500, y: 100 },   // Near spine
      },
      {
        id: 'step2',
        position: { x: 550, y: 250 },   // On spine
      },
      {
        id: 'step3',
        position: { x: 540, y: 400 },   // Slight offset
      },
    `,
  },
  
  sideTopics: {
    description: "Optional or preparatory topics",
    leftSide: "x position: 100-400 (left of spine)",
    rightSide: "x position: 700-1000 (right of spine)",
    verticalAlignment: "Align with main path vertically for visual balance",
    example: `
      // Left branch
      { id: 'prep-1', position: { x: 200, y: 150 } },
      { id: 'prep-2', position: { x: 250, y: 300 } },
      
      // Right branch
      { id: 'advanced-1', position: { x: 800, y: 150 } },
      { id: 'advanced-2', position: { x: 850, y: 300 } },
    `,
  },
};

// ============================================================================
// DATA STRUCTURE FOR SPINE-CENTERED ROADMAP
// ============================================================================

const spineReadyRoadmap = {
  nodes: [
    {
      id: 'intro',
      title: 'Introduction',
      position: { x: 545, y: 50 },      // Centered on spine
      connectedTo: ['fundamentals'],
    },
    {
      id: 'fundamentals',
      title: 'Fundamentals',
      position: { x: 550, y: 150 },     // Directly on spine
      connectedTo: ['advanced', 'specialized'],
      optionalConnections: [],
    },
    {
      id: 'specialized',
      title: 'Specialized Topics',
      position: { x: 200, y: 200 },     // Left of spine
      connectedTo: ['combined'],
    },
    {
      id: 'advanced',
      title: 'Advanced Concepts',
      position: { x: 900, y: 200 },     // Right of spine
      connectedTo: ['combined'],
    },
    {
      id: 'combined',
      title: 'Capstone Project',
      position: { x: 550, y: 350 },     // Back to spine (checkpoint)
      type: 'checkpoint',
      connectedTo: [],
    },
  ],
};

// ============================================================================
// PERFORMANCE CONSIDERATIONS
// ============================================================================

const performanceNote = `
The central spine is:
- Rendered as a single SVG <line> element (very efficient)
- Not interactive (pointer-events: none)
- Uses a reference to gradient definition (small DOM footprint)
- Does NOT impact rendering performance significantly

Even with 200+ nodes and complex connections, the spine renders instantly.
Gradient effects are GPU-accelerated in modern browsers.
`;

// ============================================================================
// BROWSER COMPATIBILITY
// ============================================================================

const compatibility = {
  svgSupport: "All modern browsers",
  linearGradient: "Fully supported (IE9+)",
  roundedLineCaps: "Fully supported (IE9+)",
  cssTransitions: "Fully supported (IE10+)",
  animations: {
    spinePulse: "Fully supported (CSS animations)",
    dashflow: "Fully supported (CSS animations)",
  },
};

export {
  spineFeatures,
  zIndexLayers,
  visualHierarchy,
  cssClasses,
  optionalSpineAnimations,
  spineContext,
  customizationGuide,
  nodePositioningForSpine,
  spineReadyRoadmap,
  performanceNote,
  compatibility,
};
