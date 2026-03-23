# Central Spine - Visual Guide & Examples

## 🎯 What the Spine Looks Like

```
┌─────────────────────────────────────────────────────────────┐
│ Roadmap.sh Style with Central Vertical Spine               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           [Topic 1]            [Topic 2]                   │
│              ╲                    ╱                         │
│               ╲                  ╱                          │
│               ╲                ╱                            │
│     [Option A] ╲              ╱ [Option B]                 │
│                 ╲            ╱                              │
│                  ╲          ╱                               │
│                   └────╫────┘  ← Nodes connected via       │
│                        ║          curves or straight lines │
│                        ║          (blue or dotted)         │
│                        ║ (spine)                           │
│                        ║ Central vertical line             │
│                        ║ Gradient fade                     │
│                        ║                                   │
│                   ┌────╫────┐                              │
│                  ╱          ╲                               │
│                ╱              ╲                             │
│              ╱                  ╲                           │
│      [Part 1]                    [Part 2]                   │
│                                                             │
│                   [Capstone Checkpoint]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 📐 Spine Positioning

### Spine Coordinates

```typescript
const spine = {
  x1: viewBoxWidth / 2,          // Dynamically centered
  y1: 80,                        // Start: 80px from top
  x2: viewBoxWidth / 2,          // Same X (vertical line)
  y2: viewBoxHeight - 50,        // End: 50px from bottom
  
  stroke: "url(#spineGradient)", // Blue gradient
  strokeWidth: 4,                // 4px thickness
  strokeLinecap: "round",        // Rounded ends
};
```

### Gradient Fade Effect

```
Top (y: 0%)
    │
    ├─────► Opacity: 0.3 (Fades in)
    │
Middle (y: 50%)
    │
    ├─────► Opacity: 0.6 (Full strength)
    │
Bottom (y: 100%)
    │
    └─────► Opacity: 0.3 (Fades out)
```

Visual result: Fades from transparent → blue → transparent

## 🎨 Color & Style Reference

### Spine Styling

```css
/* SVG Line Element */
.roadmap-spine {
  stroke: url(#spineGradient);   /* Blue (#3b82f6) gradient */
  stroke-width: 4px;              /* Medium thickness */
  stroke-linecap: round;          /* Rounded ends */
  pointer-events: none;           /* Not clickable */
  z-index: 1;                     /* Behind nodes, above background */
  transition: stroke-width 0.3s;  /* Smooth width changes */
}

/* Gradient Definition */
#spineGradient {
  x1: 0%, y1: 0%     (top-left)
  x2: 0%, y2: 100%   (bottom-left, vertical)
  
  stops: [
    { offset: 0%,    color: #3b82f6, opacity: 0.3 },
    { offset: 50%,   color: #3b82f6, opacity: 0.6 },
    { offset: 100%,  color: #3b82f6, opacity: 0.3 },
  ]
}
```

## 🔄 Z-Index Layering (Draw Order)

```
SVG Stacking Order (rendered front to back):
  4 ─────────────────────────────────
    │ Nodes (interactive)
    │ Z-index: 4
  3 ────────────────────────────────
    │ Info blocks
    │ Z-index: 3
  2 ───────────────────────────────
    │ Connection lines
    │ pointer-events: none
    │ Z-index: 2
  1 ──────────────────────────────
    │ Central spine
    │ pointer-events: none
    │ Z-index: 1
  0 ─────────────────────────────
    │ Background (white)
    │ Z-index: 0
  
  ▲ (Front, clickable)
  │
  │
  │ (Back, decorative)
```

## 📍 Typical Roadmap with Spine

### Example 1: Linear Path

```
        Start
         ║
         ║ (spine)
         ╫
        Step 1
         ║
         ╫
        Step 2
         ║
         ╫
        Goal
```

Each node positioned near x = center for alignment with spine.

### Example 2: Branching Path

```
                Intro
                 ╫
         ╱───────┼───────╲
        ╱         ║        ╲
      Basic    Intermediate Advanced
       ║         ║            ║
       ╲         ╫           ╱
        ╲      Expert      ╱
         ╲       ║       ╱
          └──────╫─────┘
             Specialist
```

Left branches at x < center, right branches at x > center,
main path nodes near x = center.

### Example 3: Complex Hierarchy

```
       ┌────► Optional 1
       │         ║
    Start ─► Core Path ─────┐
       │         ║          │
       └────► Optional 2    │
               ║            │
               ╫            │
              Deep ◄────────┘
               ║
               ╫
            Goal
```

All main steps on or near spine, branches extend left/right.

## 🎬 Optional Animations

### Pulse Animation (Disabled by Default)

```css
@keyframes spinePulse {
  0%, 100% { opacity: 0.6; }
  50%      { opacity: 0.8; }
}

/* To enable, uncomment in RoadmapCanvas.css */
.roadmap-spine {
  animation: spinePulse 8s ease-in-out infinite;
}
```

Visual effect: Line gently pulses every 8 seconds

### Hover Expand (Disabled by Default)

```css
/* To enable, uncomment in RoadmapCanvas.css */
.roadmap-canvas-container:hover .roadmap-spine {
  stroke-width: 6px;   /* Expand from 4px to 6px */
  opacity: 0.8;        /* Brighten */
}
```

Visual effect: Line thickens when you hover over the canvas

## 📊 Responsive Behavior

The spine automatically adapts to roadmap content:

```typescript
const calculateDimensions = () => {
  let maxX = 0, maxY = 0;
  
  // Check all nodes for bounds
  nodes.forEach(node => {
    maxX = Math.max(maxX, node.position.x + node.width);
    maxY = Math.max(maxY, node.position.y + node.height);
  });
  
  return {
    viewBoxWidth: Math.max(1100, maxX + 100),
    viewBoxHeight: Math.max(1400, maxY + 100),
  };
};

// Spine uses these dimensions:
const spineX = viewBoxWidth / 2;  // Always centered
const spineY2 = viewBoxHeight - 50;  // Always extends to bottom
```

Result: Spine always centered and extends full length of content.

## 🛠️ Customization Examples

### Example 1: Change Spine Color to Purple

```typescript
// In RoadmapCanvas.tsx, modify the gradient:
<linearGradient id="spineGradient">
  <stop offset="0%" style={{ stopColor: '#a855f7', stopOpacity: 0.3 }} />
  <stop offset="50%" style={{ stopColor: '#a855f7', stopOpacity: 0.6 }} />
  <stop offset="100%" style={{ stopColor: '#a855f7', stopOpacity: 0.3 }} />
</linearGradient>
```

### Example 2: Make Spine Solid (No Fade)

```typescript
// Replace gradient with solid stroke:
<line
  x1={dims.viewBoxWidth / 2}
  y1="80"
  x2={dims.viewBoxWidth / 2}
  y2={dims.viewBoxHeight - 50}
  stroke="#3b82f6"           // No gradient reference
  strokeWidth="4"
  strokeLinecap="round"
  className="roadmap-spine"
/>
```

### Example 3: Thicker Spine (6px)

```typescript
// Just change strokeWidth:
<line
  ...
  strokeWidth="6"  // Instead of "4"
  ...
/>
```

## ✨ Best Practices for Spine-Centered Roadmaps

1. **Center main path**: Position primary learning steps near x = center
2. **Branch outward**: Put optional or alternative topics on sides
3. **Align vertically**: Space nodes evenly along the spine
4. **Use connections**: Link side topics back to main spine
5. **Group related**: Cluster similar topics on left or right side
6. **Visual balance**: Roughly equal content on both sides

Example positioning:
```typescript
const nodes = [
  { id: 'start', position: { x: 550, y: 50 } },      // On spine
  { id: 'theory', position: { x: 300, y: 150 } },    // Left
  { id: 'practice', position: { x: 800, y: 150 } },  // Right
  { id: 'next', position: { x: 550, y: 250 } },      // Back to spine
];
```

## 📱 Responsive Scaling

The spine scales responsively:
- **Desktop (1200px wide)**: Spine positioned at x = 550 (centered)
- **Tablet (800px wide)**: Spine still centered, viewBox scales
- **Mobile (400px wide)**: Spine remains centered in diagonal space

The SVG `preserveAspectRatio="xMidYMid meet"` ensures consistent centering.

---

**Status**: ✅ Central spine feature complete and documented
