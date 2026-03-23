# RoadmapCanvas Connection Line Styles Documentation

## Overview

The RoadmapCanvas component renders connections between nodes with intelligent styling that matches roadmap.sh's visual design. Connections support:

- **Multiple line types**: Straight lines for adjacent nodes, curved paths for distant nodes
- **Connection status**: Solid blue for required paths, dotted gray for optional paths
- **Professional appearance**: Smooth curves, rounded endpoints, drop shadows

## Connection Line Types

### 1. Straight Lines (Adjacent Nodes)
**When rendered**: Horizontal distance between nodes ≤ 200px

**Rendering**:
- Uses SVG `<line>` element
- Direct path from node to target
- Most efficient for nearby connections

```
Node A ─────────→ Node B
(distance: 150px)
```

### 2. Curved Lines (Distant Nodes)
**When rendered**: Horizontal distance between nodes > 200px

**Rendering**:
- Uses SVG `<path>` element with cubic Bezier curve
- Creates smooth, professional appearance
- Control points positioned at 20% offset from start/end nodes

```
Node A ──╮
         ╰──→ Node B
(distance: 300px)
```

**Math**:
```
controlOffsetX = Math.max(50, horizontalDistance * 0.2)
midY = (startY + endY) / 2

controlPoint1X = startX ± controlOffsetX
controlPoint1Y = midY

controlPoint2X = endX ∓ controlOffsetX
controlPoint2Y = midY
```

## Connection Status

### Required Connections (Solid Blue)
```typescript
{
  id: 'javascript',
  connectedTo: ['react'],           // Required path
  optionalConnections: []
}
```

**Styling**:
- Stroke color: `#3b82f6` (blue)
- Width: `3px`
- Dashed: `0` (solid)
- Arrow marker: Blue arrow
- Drop shadow: Yes

### Optional Connections (Dotted Gray)
```typescript
{
  id: 'javascript',
  connectedTo: ['typescript', 'react'],
  optionalConnections: ['typescript']  // Mark as optional
}
```

**Styling**:
- Stroke color: `#94a3b8` (gray)
- Width: `3px`
- Dashed: `6,6` (6px dash, 6px gap)
- Arrow marker: Gray arrow
- Drop shadow: Subtle (reduced)
- Opacity: `0.7`

## CSS Classes

### Connection Path Elements
```css
.connection-path {
  /* Base styles for all connection paths */
  pointer-events: none;
  transition: all 0.3s ease;
}

.connection-curved {
  /* Curved connections for distant nodes */
  stroke-linecap: round;
  stroke-linejoin: round;
}

.connection-straight {
  /* Straight connections for adjacent nodes */
  stroke-linecap: round;
}

/* Blue connections (required) */
.connection-path[stroke="#3b82f6"] {
  filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.2));
}

/* Gray connections (optional) */
.connection-path[stroke="#94a3b8"] {
  filter: drop-shadow(0 0 1px rgba(148, 163, 184, 0.1));
  opacity: 0.7;
}
```

## Data Structure

### Node with Connections
```typescript
interface RoadmapNode {
  id: string;
  title: string;
  position: { x: number; y: number };
  width?: number;              // default: 160
  height?: number;             // default: 50
  type?: string;               // 'checkpoint' for dark nodes
  status?: NodeStatus;         // 'pending' | 'in-progress' | 'completed'
  
  // Connections
  connectedTo?: string[];      // Required paths to other nodes
  optionalConnections?: string[];  // Subset of connectedTo marked as optional
  
  description?: string;
  resources?: { free: [...], premium: [...] };
}
```

### Connection Rules

1. **Required connection**: Node appears in `connectedTo` but NOT in `optionalConnections`
   - Renders as **solid blue line**

2. **Optional connection**: Node appears in BOTH `connectedTo` AND `optionalConnections`
   - Renders as **dotted gray line**

3. **No connection**: Node not in `connectedTo`
   - No line rendered

### Example: Multiple Connection Types
```typescript
{
  id: 'javascript',
  title: 'JavaScript',
  position: { x: 100, y: 100 },
  connectedTo: ['typescript', 'react', 'node'],
  optionalConnections: ['typescript', 'node']
  // Result:
  // - TypeScript: dotted gray line (optional)
  // - React: solid blue line (required)
  // - Node: dotted gray line (optional)
}
```

## Arrow Markers

### Required Path Arrow (Blue)
```svg
<marker id="arrowhead">
  <path d="M 0 0 L 12 6 L 0 12 z" fill="#3b82f6" />
</marker>
```

### Optional Path Arrow (Gray)
```svg
<marker id="arrowhead-dotted">
  <path d="M 0 0 L 12 6 L 0 12 z" fill="#94a3b8" />
</marker>
```

## Implementation Details

### renderConnection Function
Located in `RoadmapCanvas.tsx`:

```typescript
const renderConnection = (node: RoadmapNode, targetId: string) => {
  const target = nodes.find(n => n.id === targetId);
  if (!target) return null;
  
  // Calculate positions
  const startX = node.position.x + (node.width || 160) / 2;
  const startY = node.position.y + (node.height || 50);
  const endX = target.position.x + (target.width || 160) / 2;
  const endY = target.position.y;
  
  // Determine styling
  const isOptional = node.optionalConnections?.includes(targetId);
  const horizontalDistance = Math.abs(startX - endX);
  const isCurved = horizontalDistance > 200;
  
  // Render appropriate element
  if (isCurved) {
    // SVG <path> with cubic Bezier
  } else {
    // SVG <line>
  }
};
```

## Performance Considerations

- **Straight lines**: Efficient, uses simple `<line>` elements
- **Curved lines**: Slightly more complex with `<path>` and Bezier calculations
- **Rendering**: All connections rendered upfront (no lazy loading)
- **SVG optimization**: Use `pointer-events: none` on paths to improve interactivity

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- SVG support required
- Cubic Bezier curves fully supported
- CSS filters (drop-shadow) supported in all modern browsers

## Customization

### Change curve threshold
Modify the `200` value in `renderConnection`:
```typescript
const isCurved = horizontalDistance > 200;  // Change threshold here
```

### Change curve intensity
Adjust the control point offset multiplier:
```typescript
const controlOffsetX = Math.max(50, horizontalDistance * 0.2);  // 0.2 = 20% offset
```

### Enable animated dashed lines
Uncomment the keyframe animation in `RoadmapCanvas.css`:
```css
@keyframes dashflow {
  0% { stroke-dashoffset: 0; }
  100% { stroke-dashoffset: 12; }
}

.connection-path[stroke="#94a3b8"] {
  animation: dashflow 20s linear infinite;
}
```

### Dynamic styling
Modify stroke colors or dash patterns by changing:
```typescript
const strokeColor = isOptional ? "#94a3b8" : "#3b82f6";
const strokeDasharray = isOptional ? "6,6" : "0";
```

## Examples

See `RoadmapCanvas.examples.ts` for:
- Basic roadmap with required connections
- Complex roadmap with optional paths
- Real-world learning path examples
- Connection behavior reference table
