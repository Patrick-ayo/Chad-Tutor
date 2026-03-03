/**
 * Game Developer Roadmap Seed Script
 *
 * Seeds the Game Developer development roadmap into the Skill graph.
 *
 * Usage:
 *   npx ts-node prisma/seed/game-developer.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// Game Developer Roadmap - Complete Structure
const ROADMAP_NODES_DATA = [
  // Root
  { slug: 'game-developer', name: 'Game Developer', description: 'Complete Game Developer roadmap', difficulty: Difficulty.INTERMEDIATE, sortOrder: 0 },

  // ==== CLIENT SIDE DEVELOPMENT ====
  { slug: 'client-side-development', name: 'Client Side Development', description: 'Client-side game development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 1 },

  // Game Mathematics
  { slug: 'game-mathematics', name: 'Game Mathematics', description: 'Mathematical foundations for games', difficulty: Difficulty.INTERMEDIATE, sortOrder: 2 },
  { slug: 'linear-algebra', name: 'Linear Algebra', description: 'Linear algebra fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 3 },
  { slug: 'vector', name: 'Vector', description: 'Vector mathematics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 4 },
  { slug: 'matrix', name: 'Matrix', description: 'Matrix operations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 5 },
  { slug: 'linear-transformation', name: 'Linear Transformation', description: 'Linear transformation concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 6 },
  { slug: 'geometry', name: 'Geometry', description: 'Geometric concepts', difficulty: Difficulty.INTERMEDIATE, sortOrder: 7 },
  { slug: 'affine-space', name: 'Affine Space', description: 'Affine space mathematics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 8 },
  { slug: 'affine-transformation', name: 'Affine Transformation', description: 'Affine transformations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 9 },
  { slug: 'projection', name: 'Projection', description: 'Projection techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 10 },
  { slug: 'orientation', name: 'Orientation', description: 'Orientation in 3D space', difficulty: Difficulty.INTERMEDIATE, sortOrder: 11 },
  { slug: 'perspective', name: 'Perspective', description: 'Perspective projection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 12 },
  { slug: 'quaternion', name: 'Quaternion', description: 'Quaternion mathematics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 13 },
  { slug: 'orthogonal', name: 'Orthogonal', description: 'Orthogonal transformations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 14 },
  { slug: 'euler-angle', name: 'Euler Angle', description: 'Euler angles for rotation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 15 },

  // Game Engine
  { slug: 'game-engine', name: 'Game Engine', description: 'Game engine selection and fundamentals', difficulty: Difficulty.INTERMEDIATE, sortOrder: 16 },
  { slug: 'unity-3d', name: 'Unity 3D', description: 'Unity game engine', difficulty: Difficulty.INTERMEDIATE, sortOrder: 17 },
  { slug: 'unreal-engine', name: 'Unreal Engine', description: 'Unreal Engine', difficulty: Difficulty.INTERMEDIATE, sortOrder: 18 },
  { slug: 'native', name: 'Native', description: 'Native game development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 19 },
  { slug: 'godot', name: 'Godot', description: 'Godot game engine', difficulty: Difficulty.INTERMEDIATE, sortOrder: 20 },

  // Programming Languages
  { slug: 'programming-languages-gd', name: 'Programming Languages', description: 'Game development languages', difficulty: Difficulty.INTERMEDIATE, sortOrder: 21 },
  { slug: 'csharp', name: 'C#', description: 'C# programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 22 },
  { slug: 'cpp', name: 'C/C++', description: 'C and C++ languages', difficulty: Difficulty.INTERMEDIATE, sortOrder: 23 },
  { slug: 'rust-gd', name: 'Rust', description: 'Rust programming language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 24 },
  { slug: 'python-gd', name: 'Python', description: 'Python programming', difficulty: Difficulty.INTERMEDIATE, sortOrder: 25 },
  { slug: 'gdscript', name: 'GDScript', description: 'GDScript for Godot', difficulty: Difficulty.INTERMEDIATE, sortOrder: 26 },

  // Computer Graphics
  { slug: 'computer-graphics', name: 'Computer Graphics', description: 'Graphics fundamentals for games', difficulty: Difficulty.INTERMEDIATE, sortOrder: 27 },
  { slug: 'ray-tracing', name: 'Ray Tracing', description: 'Ray tracing techniques', difficulty: Difficulty.ADVANCED, sortOrder: 28 },
  { slug: 'rasterization', name: 'Rasterization', description: 'Rasterization rendering', difficulty: Difficulty.INTERMEDIATE, sortOrder: 29 },
  { slug: 'graphics-pipeline', name: 'Graphics Pipeline', description: 'Graphics rendering pipeline', difficulty: Difficulty.INTERMEDIATE, sortOrder: 30 },
  { slug: 'sampling', name: 'Sampling', description: 'Sampling techniques in graphics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 31 },
  { slug: 'shader', name: 'Shader', description: 'Graphics shaders', difficulty: Difficulty.INTERMEDIATE, sortOrder: 32 },
  { slug: 'rendering-equation', name: 'Rendering Equation', description: 'Rendering equation fundamentals', difficulty: Difficulty.ADVANCED, sortOrder: 33 },
  { slug: 'mapping', name: 'Mapping', description: 'Texture and environment mapping', difficulty: Difficulty.INTERMEDIATE, sortOrder: 34 },
  { slug: 'reflection', name: 'Reflection', description: 'Reflection and refraction', difficulty: Difficulty.INTERMEDIATE, sortOrder: 35 },
  { slug: 'texture', name: 'Texture', description: 'Texture mapping and filtering', difficulty: Difficulty.INTERMEDIATE, sortOrder: 36 },
  { slug: 'diffuse', name: 'Diffuse', description: 'Diffuse lighting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 37 },
  { slug: 'bump', name: 'Bump', description: 'Bump mapping', difficulty: Difficulty.INTERMEDIATE, sortOrder: 38 },
  { slug: 'specular', name: 'Specular', description: 'Specular lighting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 39 },
  { slug: 'parallax', name: 'Parallax', description: 'Parallax mapping', difficulty: Difficulty.INTERMEDIATE, sortOrder: 40 },
  { slug: 'horizon', name: 'Horizon', description: 'Horizon-based ambient occlusion', difficulty: Difficulty.INTERMEDIATE, sortOrder: 41 },

  // Graphics API
  { slug: 'graphics-api', name: 'Graphics API', description: 'Graphics programming APIs', difficulty: Difficulty.INTERMEDIATE, sortOrder: 42 },
  { slug: 'hlsl', name: 'HLSL', description: 'High Level Shading Language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 43 },
  { slug: 'glsl', name: 'GLSL', description: 'OpenGL Shading Language', difficulty: Difficulty.INTERMEDIATE, sortOrder: 44 },
  { slug: 'spirv', name: 'SPIR-V', description: 'SPIR-V intermediate representation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 45 },
  { slug: 'directx', name: 'DirectX', description: 'DirectX API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 46 },
  { slug: 'opengl', name: 'OpenGL', description: 'OpenGL API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 47 },
  { slug: 'vulkan', name: 'Vulkan', description: 'Vulkan graphics API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 48 },
  { slug: 'opengl-es', name: 'OpenGL ES', description: 'OpenGL ES for mobile', difficulty: Difficulty.INTERMEDIATE, sortOrder: 49 },
  { slug: 'metal', name: 'Metal', description: 'Apple Metal API', difficulty: Difficulty.INTERMEDIATE, sortOrder: 50 },
  { slug: 'webgl', name: 'WebGL', description: 'WebGL for web games', difficulty: Difficulty.INTERMEDIATE, sortOrder: 51 },

  // Game AI
  { slug: 'game-ai', name: 'Game AI', description: 'Artificial Intelligence for games', difficulty: Difficulty.INTERMEDIATE, sortOrder: 52 },
  { slug: 'naive-bayes', name: 'Naive Bayes Classifier', description: 'Naive Bayes classification', difficulty: Difficulty.INTERMEDIATE, sortOrder: 53 },
  { slug: 'decision-learning', name: 'Decision Learning', description: 'Learning decision making', difficulty: Difficulty.INTERMEDIATE, sortOrder: 54 },
  { slug: 'reinforcements-learning', name: 'Reinforcements Learning', description: 'Reinforcement learning', difficulty: Difficulty.ADVANCED, sortOrder: 55 },
  { slug: 'decision-tree-learning', name: 'Decision Tree Learning', description: 'Decision tree algorithms', difficulty: Difficulty.INTERMEDIATE, sortOrder: 56 },
  { slug: 'deep-learning', name: 'Deep Learning', description: 'Deep learning for games', difficulty: Difficulty.ADVANCED, sortOrder: 57 },
  { slug: 'artificial-neural-network', name: 'Artificial Neural Network', description: 'Neural networks for AI', difficulty: Difficulty.ADVANCED, sortOrder: 58 },

  // ==== GAME PHYSICS ====
  { slug: 'game-physics', name: 'Game Physics', description: 'Physics simulation in games', difficulty: Difficulty.INTERMEDIATE, sortOrder: 59 },
  { slug: 'center-of-mass', name: 'Center of Mass', description: 'Center of mass calculations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 60 },
  { slug: 'moment-of-inertia', name: 'Moment of Inertia', description: 'Moment of inertia', difficulty: Difficulty.INTERMEDIATE, sortOrder: 61 },
  { slug: 'acceleration', name: 'Acceleration', description: 'Acceleration physics', difficulty: Difficulty.INTERMEDIATE, sortOrder: 62 },
  { slug: 'joints', name: 'Joints', description: 'Joint constraints', difficulty: Difficulty.INTERMEDIATE, sortOrder: 63 },
  { slug: 'restitution', name: 'Restitution', description: 'Coefficient of restitution', difficulty: Difficulty.INTERMEDIATE, sortOrder: 64 },
  { slug: 'force', name: 'Force', description: 'Force calculations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 65 },
  { slug: 'angular-velocity', name: 'Angular Velocity', description: 'Angular velocity', difficulty: Difficulty.INTERMEDIATE, sortOrder: 66 },
  { slug: 'buoyancy', name: 'Buoyancy', description: 'Buoyancy forces', difficulty: Difficulty.INTERMEDIATE, sortOrder: 67 },
  { slug: 'friction', name: 'Friction', description: 'Friction simulation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 68 },
  { slug: 'linear-velocity', name: 'Linear Velocity', description: 'Linear velocity', difficulty: Difficulty.INTERMEDIATE, sortOrder: 69 },
  { slug: 'dynamics', name: 'Dynamics', description: 'Dynamics simulation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 70 },

  // Collision Detection
  { slug: 'collision-detection', name: 'Collision Detection', description: 'Detecting collisions', difficulty: Difficulty.INTERMEDIATE, sortOrder: 71 },
  { slug: 'sat', name: 'SAT', description: 'Separating Axis Theorem', difficulty: Difficulty.INTERMEDIATE, sortOrder: 72 },
  { slug: 'gjk', name: 'GJK', description: 'Gilbert-Johnson-Keerthi algorithm', difficulty: Difficulty.ADVANCED, sortOrder: 73 },
  { slug: 'epa', name: 'EPA', description: 'Expanding Polytope Algorithm', difficulty: Difficulty.ADVANCED, sortOrder: 74 },

  // Intersection Tests
  { slug: 'intersection', name: 'Intersection', description: 'Intersection testing', difficulty: Difficulty.INTERMEDIATE, sortOrder: 75 },
  { slug: 'convexity', name: 'Convexity', description: 'Convexity in collision detection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 76 },
  { slug: 'convex-hull', name: 'Convex Hull', description: 'Convex hull computations', difficulty: Difficulty.INTERMEDIATE, sortOrder: 77 },
  { slug: 'convex-decomposition', name: 'Convex Decomposition', description: 'Convex shape decomposition', difficulty: Difficulty.INTERMEDIATE, sortOrder: 78 },
  { slug: 'convex', name: 'Convex', description: 'Convex shapes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 79 },
  { slug: 'concave', name: 'Concave', description: 'Concave shapes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 80 },

  // Physics Shapes
  { slug: 'obb', name: 'OBB', description: 'Oriented Bounding Box', difficulty: Difficulty.INTERMEDIATE, sortOrder: 81 },
  { slug: 'aabb', name: 'AABB', description: 'Axis-Aligned Bounding Box', difficulty: Difficulty.INTERMEDIATE, sortOrder: 82 },

  // Spatial Partitioning
  { slug: 'sort-and-sweep', name: 'Sort & Sweep', description: 'Sort and sweep collision detection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 83 },
  { slug: 'spatial-partitioning', name: 'Spatial Partitioning', description: 'Spatial data partitioning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 84 },
  { slug: 'dbvt', name: 'DBVT', description: 'Dynamic Bounding Volume Tree', difficulty: Difficulty.ADVANCED, sortOrder: 85 },
  { slug: 'bvh', name: 'BVH', description: 'Bounding Volume Hierarchy', difficulty: Difficulty.ADVANCED, sortOrder: 86 },

  // CCD
  { slug: 'ccd', name: 'CCD', description: 'Continuous Collision Detection', difficulty: Difficulty.ADVANCED, sortOrder: 87 },
  { slug: 'narrow-phase', name: 'Narrow Phase', description: 'Narrow phase collision detection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 88 },
  { slug: 'broad-phase', name: 'Broad Phase', description: 'Broad phase collision detection', difficulty: Difficulty.INTERMEDIATE, sortOrder: 89 },

  // Lighting & Shadow
  { slug: 'lighting-shadow', name: 'Lighting and Shadow', description: 'Lighting and shadow techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 90 },
  { slug: 'shadow-map', name: 'Shadow Map', description: 'Shadow mapping', difficulty: Difficulty.INTERMEDIATE, sortOrder: 91 },
  { slug: 'light-source', name: 'Light Source', description: 'Light source representation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 92 },
  { slug: 'stencil-shadow', name: 'Stencil Shadow', description: 'Stencil shadow volumes', difficulty: Difficulty.INTERMEDIATE, sortOrder: 93 },

  // Light Types
  { slug: '2d-light', name: '2D', description: '2D lighting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 94 },
  { slug: 'cube-light', name: 'Cube', description: 'Cube mapping for lighting', difficulty: Difficulty.INTERMEDIATE, sortOrder: 95 },
  { slug: 'directional-light', name: 'Directional', description: 'Directional lights', difficulty: Difficulty.INTERMEDIATE, sortOrder: 96 },
  { slug: 'spot-light', name: 'Spot', description: 'Spot lights', difficulty: Difficulty.INTERMEDIATE, sortOrder: 97 },

  // Visibility & Occlusion
  { slug: 'visibility-occlusion', name: 'Visibility and Occlusion', description: 'Visibility culling and occlusion', difficulty: Difficulty.INTERMEDIATE, sortOrder: 98 },
  { slug: 'cascoded', name: 'Cascoded', description: 'Cascaded shadow maps', difficulty: Difficulty.INTERMEDIATE, sortOrder: 99 },
  { slug: 'infinite-light', name: 'Infinite', description: 'Infinite light sources', difficulty: Difficulty.INTERMEDIATE, sortOrder: 100 },
  { slug: 'point-light', name: 'Point', description: 'Point lights', difficulty: Difficulty.INTERMEDIATE, sortOrder: 101 },
  { slug: 'occlusion', name: 'Occlusion', description: 'Occlusion culling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 102 },
  { slug: 'culling', name: 'Culling', description: 'View frustum culling', difficulty: Difficulty.INTERMEDIATE, sortOrder: 103 },
  { slug: 'clipping', name: 'Clipping', description: 'Viewport clipping', difficulty: Difficulty.INTERMEDIATE, sortOrder: 104 },
  { slug: 'fog', name: 'Fog', description: 'Fog effects', difficulty: Difficulty.INTERMEDIATE, sortOrder: 105 },
  { slug: 'frustum', name: 'Frustum', description: 'View frustum', difficulty: Difficulty.INTERMEDIATE, sortOrder: 106 },
  { slug: 'polygon', name: 'Polygon', description: 'Polygon rendering', difficulty: Difficulty.INTERMEDIATE, sortOrder: 107 },
  { slug: 'light-occlusion', name: 'Light', description: 'Light and shadow', difficulty: Difficulty.INTERMEDIATE, sortOrder: 108 },
  { slug: 'polyhedron', name: 'Polyhedron', description: 'Polyhedron rendering', difficulty: Difficulty.INTERMEDIATE, sortOrder: 109 },
  { slug: 'shadow-occlusion', name: 'Shadow', description: 'Shadow rendering', difficulty: Difficulty.INTERMEDIATE, sortOrder: 110 },

  // Computer Animation
  { slug: 'computer-animation', name: 'Computer Animation', description: 'Animation techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 111 },
  { slug: 'color-animation', name: 'Color', description: 'Color animation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 112 },
  { slug: 'visual-perception', name: 'Visual Perception', description: 'Visual perception in animation', difficulty: Difficulty.INTERMEDIATE, sortOrder: 113 },
  { slug: 'tone-reproduction', name: 'Tone Reproduction', description: 'Tone reproduction techniques', difficulty: Difficulty.INTERMEDIATE, sortOrder: 114 },

  // Curve Types
  { slug: 'spline-curve', name: 'Spline', description: 'Spline curves', difficulty: Difficulty.INTERMEDIATE, sortOrder: 115 },
  { slug: 'hermite-curve', name: 'Hermite', description: 'Hermite curves', difficulty: Difficulty.INTERMEDIATE, sortOrder: 116 },
  { slug: 'bezier-curve', name: 'Bezier', description: 'Bezier curves', difficulty: Difficulty.INTERMEDIATE, sortOrder: 117 },
  { slug: 'catmull-rom', name: 'Catmull-Rom', description: 'Catmull-Rom curves', difficulty: Difficulty.INTERMEDIATE, sortOrder: 118 },

  // Server Side
  { slug: 'server-side', name: 'Server Side', description: 'Server-side game development', difficulty: Difficulty.INTERMEDIATE, sortOrder: 119 },

  // Advanced Rendering
  { slug: 'advanced-rendering', name: 'Advanced Rendering', description: 'Advanced rendering techniques', difficulty: Difficulty.ADVANCED, sortOrder: 120 },
  { slug: 'physically-based-rendering', name: 'Physically-Based Rendering', description: 'PBR techniques', difficulty: Difficulty.ADVANCED, sortOrder: 121 },
  { slug: 'real-time-ray-tracing', name: 'Real-time Ray Tracing', description: 'Real-time ray tracing', difficulty: Difficulty.ADVANCED, sortOrder: 122 },
  { slug: 'directx-ray-tracing', name: 'DirectX Ray Tracing', description: 'DirectX ray tracing', difficulty: Difficulty.ADVANCED, sortOrder: 123 },
  { slug: 'vulkan-ray-tracing', name: 'Vulkan Ray Tracing', description: 'Vulkan ray tracing', difficulty: Difficulty.ADVANCED, sortOrder: 124 },
  { slug: 'optix', name: 'OptiX', description: 'NVIDIA OptiX ray tracing', difficulty: Difficulty.ADVANCED, sortOrder: 125 },

  // Advanced Rendering Details
  { slug: 'microsurface-scattering', name: 'Microsurface Scattering', description: 'Microsurface scattering', difficulty: Difficulty.ADVANCED, sortOrder: 126 },
  { slug: 'translucency-transparency', name: 'Translucency & Transparency', description: 'Translucency and transparency', difficulty: Difficulty.ADVANCED, sortOrder: 127 },
  { slug: 'conservation-energy', name: 'Conservation of Energy', description: 'Energy conservation in rendering', difficulty: Difficulty.ADVANCED, sortOrder: 128 },
  { slug: 'metallicity', name: 'Metallicity', description: 'Metallic surfaces', difficulty: Difficulty.ADVANCED, sortOrder: 129 },

  // Getting Deeper - Learning
  { slug: 'learning-ai', name: 'Learning', description: 'Machine learning for games', difficulty: Difficulty.ADVANCED, sortOrder: 130 },

  // AI Learning Types
  { slug: 'learning-game-ai', name: 'Game AI', description: 'Game AI learning', difficulty: Difficulty.ADVANCED, sortOrder: 131 },
  { slug: 'decision-making', name: 'Decision Making', description: 'AI decision making', difficulty: Difficulty.ADVANCED, sortOrder: 132 },
  { slug: 'movement', name: 'Movement', description: 'AI movement behavior', difficulty: Difficulty.ADVANCED, sortOrder: 133 },
  { slug: 'decision-tree-ai', name: 'Decision Tree', description: 'Decision trees for AI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 134 },
  { slug: 'state-machine', name: 'State Machine', description: 'State machine AI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 135 },
  { slug: 'behavior-tree', name: 'Behavior Tree', description: 'Behavior trees', difficulty: Difficulty.INTERMEDIATE, sortOrder: 136 },
  { slug: 'fuzzy-logic', name: 'Fuzzy Logic', description: 'Fuzzy logic in game AI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 137 },
  { slug: 'ab-pruning', name: 'AB Pruning', description: 'Alpha-beta pruning', difficulty: Difficulty.INTERMEDIATE, sortOrder: 138 },
  { slug: 'markov-system', name: 'Markov System', description: 'Markov systems', difficulty: Difficulty.ADVANCED, sortOrder: 139 },
  { slug: 'mcts', name: 'MCTS', description: 'Monte Carlo Tree Search', difficulty: Difficulty.ADVANCED, sortOrder: 140 },
  { slug: 'goal-oriented-behavior', name: 'Goal Oriented Behavior', description: 'Goal-oriented AI behavior', difficulty: Difficulty.ADVANCED, sortOrder: 141 },
  { slug: 'board-game', name: 'Board Game', description: 'Board game AI', difficulty: Difficulty.INTERMEDIATE, sortOrder: 142 },
  { slug: 'minimax', name: 'Minimax', description: 'Minimax algorithm', difficulty: Difficulty.INTERMEDIATE, sortOrder: 143 },

  // Keep Learning
  { slug: 'keep-learning-gd', name: 'Maximize your skills', description: 'Continue learning game development', difficulty: Difficulty.BEGINNER, sortOrder: 144 },
];

const ROADMAP_EDGES_DATA = [
  // Client Side Development Path
  { source: 'client-side-development', target: 'game-developer', type: SkillEdgeType.SUBSKILL_OF },

  // Game Mathematics
  { source: 'game-mathematics', target: 'client-side-development', type: SkillEdgeType.PREREQUISITE },
  { source: 'linear-algebra', target: 'game-mathematics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vector', target: 'linear-algebra', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'matrix', target: 'linear-algebra', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'linear-transformation', target: 'linear-algebra', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'geometry', target: 'game-mathematics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'affine-space', target: 'geometry', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'affine-transformation', target: 'geometry', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'projection', target: 'geometry', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'orientation', target: 'geometry', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'perspective', target: 'projection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'quaternion', target: 'game-mathematics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'orthogonal', target: 'game-mathematics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'euler-angle', target: 'game-mathematics', type: SkillEdgeType.SUBSKILL_OF },

  // Game Engine
  { source: 'game-engine', target: 'client-side-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unity-3d', target: 'game-engine', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'unreal-engine', target: 'game-engine', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'native', target: 'game-engine', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'godot', target: 'game-engine', type: SkillEdgeType.SUBSKILL_OF },

  // Programming Languages
  { source: 'programming-languages-gd', target: 'client-side-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'csharp', target: 'programming-languages-gd', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cpp', target: 'programming-languages-gd', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rust-gd', target: 'programming-languages-gd', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'python-gd', target: 'programming-languages-gd', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gdscript', target: 'programming-languages-gd', type: SkillEdgeType.SUBSKILL_OF },

  // Computer Graphics
  { source: 'computer-graphics', target: 'client-side-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ray-tracing', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rasterization', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'graphics-pipeline', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sampling', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'shader', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'rendering-equation', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mapping', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reflection', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'texture', target: 'mapping', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'diffuse', target: 'texture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bump', target: 'texture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'specular', target: 'texture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'parallax', target: 'texture', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'horizon', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },

  // Graphics API
  { source: 'graphics-api', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hlsl', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'glsl', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spirv', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'directx', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'opengl', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vulkan', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'opengl-es', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'metal', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'webgl', target: 'graphics-api', type: SkillEdgeType.SUBSKILL_OF },

  // Game AI
  { source: 'game-ai', target: 'client-side-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'naive-bayes', target: 'game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decision-learning', target: 'game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'reinforcements-learning', target: 'game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decision-tree-learning', target: 'game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'deep-learning', target: 'game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'artificial-neural-network', target: 'game-ai', type: SkillEdgeType.SUBSKILL_OF },

  // Game Physics
  { source: 'game-physics', target: 'client-side-development', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'center-of-mass', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'moment-of-inertia', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'acceleration', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'joints', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'restitution', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'force', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'angular-velocity', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'buoyancy', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'friction', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'linear-velocity', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dynamics', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },

  // Collision Detection
  { source: 'collision-detection', target: 'game-physics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'sat', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'gjk', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'epa', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },

  // Intersection Tests
  { source: 'intersection', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'convexity', target: 'intersection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'convex-hull', target: 'convexity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'convex-decomposition', target: 'convexity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'convex', target: 'convexity', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'concave', target: 'convexity', type: SkillEdgeType.SUBSKILL_OF },

  // Physics Shapes
  { source: 'obb', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'aabb', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },

  // Spatial Partitioning
  { source: 'sort-and-sweep', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spatial-partitioning', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'dbvt', target: 'spatial-partitioning', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bvh', target: 'spatial-partitioning', type: SkillEdgeType.SUBSKILL_OF },

  // CCD
  { source: 'ccd', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'narrow-phase', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'broad-phase', target: 'collision-detection', type: SkillEdgeType.SUBSKILL_OF },

  // Lighting & Shadow
  { source: 'lighting-shadow', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'shadow-map', target: 'lighting-shadow', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'light-source', target: 'lighting-shadow', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'stencil-shadow', target: 'lighting-shadow', type: SkillEdgeType.SUBSKILL_OF },

  // Light Types
  { source: '2d-light', target: 'lighting-shadow', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cube-light', target: 'lighting-shadow', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'directional-light', target: 'lighting-shadow', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'spot-light', target: 'lighting-shadow', type: SkillEdgeType.SUBSKILL_OF },

  // Visibility & Occlusion
  { source: 'visibility-occlusion', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'cascoded', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'infinite-light', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'point-light', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'occlusion', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'culling', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'clipping', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fog', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'frustum', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'polygon', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'light-occlusion', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'polyhedron', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'shadow-occlusion', target: 'visibility-occlusion', type: SkillEdgeType.SUBSKILL_OF },

  // Computer Animation
  { source: 'computer-animation', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'color-animation', target: 'computer-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'visual-perception', target: 'computer-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'tone-reproduction', target: 'computer-animation', type: SkillEdgeType.SUBSKILL_OF },

  // Curve Types
  { source: 'spline-curve', target: 'computer-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'hermite-curve', target: 'computer-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'bezier-curve', target: 'computer-animation', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'catmull-rom', target: 'computer-animation', type: SkillEdgeType.SUBSKILL_OF },

  // Server Side
  { source: 'server-side', target: 'game-developer', type: SkillEdgeType.SUBSKILL_OF },

  // Advanced Rendering
  { source: 'advanced-rendering', target: 'computer-graphics', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'physically-based-rendering', target: 'advanced-rendering', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'real-time-ray-tracing', target: 'advanced-rendering', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'directx-ray-tracing', target: 'real-time-ray-tracing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'vulkan-ray-tracing', target: 'real-time-ray-tracing', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'optix', target: 'real-time-ray-tracing', type: SkillEdgeType.SUBSKILL_OF },

  // Advanced Rendering Details
  { source: 'microsurface-scattering', target: 'advanced-rendering', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'translucency-transparency', target: 'advanced-rendering', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'conservation-energy', target: 'advanced-rendering', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'metallicity', target: 'advanced-rendering', type: SkillEdgeType.SUBSKILL_OF },

  // Learning AI
  { source: 'learning-ai', target: 'game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'learning-game-ai', target: 'learning-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decision-making', target: 'learning-game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'movement', target: 'learning-game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'decision-tree-ai', target: 'decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'state-machine', target: 'decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'behavior-tree', target: 'decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'fuzzy-logic', target: 'decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'ab-pruning', target: 'decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'markov-system', target: 'learning-game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'mcts', target: 'learning-game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'goal-oriented-behavior', target: 'learning-game-ai', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'board-game', target: 'decision-making', type: SkillEdgeType.SUBSKILL_OF },
  { source: 'minimax', target: 'decision-making', type: SkillEdgeType.SUBSKILL_OF },

  // Keep Learning
  { source: 'keep-learning-gd', target: 'game-developer', type: SkillEdgeType.SUBSKILL_OF },
];

interface RoadmapNode {
  slug: string;
  name: string;
  description: string;
  difficulty: any;
  sortOrder: number;
}

const ROADMAP_NODES: RoadmapNode[] = ROADMAP_NODES_DATA as RoadmapNode[];

async function main() {
  console.log('Starting Game Developer roadmap seed...\n');

  // Create or update category
  const category = await prisma.skillCategory.upsert({
    where: { slug: 'game-developer' },
    update: { name: 'Game Developer', description: 'Game Developer specialization' },
    create: {
      name: 'Game Developer',
      slug: 'game-developer',
      description: 'Game Developer specialization',
    },
  });
  console.log('✓ Category created/updated');

  // Insert all skills
  console.log(`Inserting ${ROADMAP_NODES.length} skills...`);
  for (const node of ROADMAP_NODES) {
    await prisma.skill.upsert({
      where: { slug: node.slug },
      update: {
        name: node.name,
        description: node.description,
        difficulty: node.difficulty,
        categoryId: category.id,
      },
      create: {
        slug: node.slug,
        name: node.name,
        normalizedName: node.name.toLowerCase().replace(/\s+/g, '-'),
        description: node.description,
        difficulty: node.difficulty,
        categoryId: category.id,
      },
    });
  }
  console.log(`✓ ${ROADMAP_NODES.length} skills inserted`);

  // Create or update roadmap
  const rootSkill = await prisma.skill.findUnique({
    where: { slug: 'game-developer' },
  });
  const roadmap = await prisma.roadmap.upsert({
    where: { slug: 'game-developer' },
    update: {
      name: 'Game Developer',
      description: 'Comprehensive Game Developer roadmap covering game mathematics, engines, graphics, physics, collision detection, lighting, animation, AI, and advanced rendering techniques',
      icon: '🎮',
      color: '#EC4899',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
    create: {
      name: 'Game Developer',
      slug: 'game-developer',
      description: 'Comprehensive Game Developer roadmap covering game mathematics, engines, graphics, physics, collision detection, lighting, animation, AI, and advanced rendering techniques',
      icon: '🎮',
      color: '#EC4899',
      isPublished: true,
      rootSkillId: rootSkill?.id,
    },
  });
  console.log('✓ Roadmap created/updated');

  // Link all skills to this roadmap
  const allSkillSlugs = ROADMAP_NODES.map(n => n.slug);
  await prisma.skill.updateMany({
    where: { slug: { in: allSkillSlugs } },
    data: { roadmapId: roadmap.id },
  });
  console.log('✓ Skills linked to roadmap');

  // Delete old edges for clean re-seed
  const allSkills = await prisma.skill.findMany({
    where: { slug: { in: allSkillSlugs } },
    select: { id: true, slug: true },
  });
  const slugToId = new Map(allSkills.map(s => [s.slug, s.id]));
  const skillIds = allSkills.map(s => s.id);

  await prisma.skillEdge.deleteMany({
    where: {
      OR: [
        { sourceId: { in: skillIds } },
        { targetId: { in: skillIds } },
      ],
    },
  });
  console.log('✓ Old edges cleaned');

  // Insert edges
  console.log(`Inserting ${ROADMAP_EDGES_DATA.length} edges...`);
  for (const edge of ROADMAP_EDGES_DATA) {
    const sourceId = slugToId.get(edge.source);
    const targetId = slugToId.get(edge.target);

    if (sourceId && targetId) {
      await prisma.skillEdge.create({
        data: {
          sourceId,
          targetId,
          edgeType: edge.type,
          strength: 1.0,
          isStrict: false,
        },
      });
    }
  }
  console.log(`✓ ${ROADMAP_EDGES_DATA.length} edges inserted`);

  console.log('\n✓ Game Developer roadmap seeded successfully!');
  console.log(`  - ${ROADMAP_NODES.length} skills`);
  console.log(`  - ${ROADMAP_EDGES_DATA.length} edges`);
}

main()
  .catch((e) => {
    console.error('Error seeding roadmap:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
