/**
 * Skill Seed Script
 * 
 * Seeds the initial skill graph with programming languages, 
 * categories, tags, and edge relationships.
 * 
 * Usage:
 *   npx ts-node prisma/seed/skills.seed.ts
 */

import { PrismaClient, SkillEdgeType, Difficulty } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================================
// SEED DATA - CATEGORIES
// ============================================================================

const CATEGORIES = [
  { name: 'Programming Languages', slug: 'languages', description: 'Core programming languages', icon: '💻', color: '#3B82F6', sortOrder: 1 },
  { name: 'Web Development', slug: 'web', description: 'Frontend and backend web technologies', icon: '🌐', color: '#10B981', sortOrder: 2 },
  { name: 'Data & Databases', slug: 'data', description: 'Data structures, algorithms, and databases', icon: '📊', color: '#8B5CF6', sortOrder: 3 },
  { name: 'DevOps & Tools', slug: 'devops', description: 'Development operations and tooling', icon: '🔧', color: '#F59E0B', sortOrder: 4 },
  { name: 'Computer Science', slug: 'cs', description: 'Core CS concepts and theory', icon: '🎓', color: '#EF4444', sortOrder: 5 },
];

// ============================================================================
// SEED DATA - TAGS
// ============================================================================

const TAGS = [
  { name: 'Backend', slug: 'backend', color: '#4ECDC4' },
  { name: 'Frontend', slug: 'frontend', color: '#FF6B6B' },
  { name: 'Full Stack', slug: 'fullstack', color: '#9B59B6' },
  { name: 'Beginner Friendly', slug: 'beginner-friendly', color: '#2ECC71' },
  { name: 'Interview Prep', slug: 'interview-prep', color: '#E74C3C' },
  { name: 'In Demand', slug: 'in-demand', color: '#F39C12' },
  { name: 'Systems Programming', slug: 'systems', color: '#34495E' },
  { name: 'Scripting', slug: 'scripting', color: '#1ABC9C' },
  { name: 'Mobile', slug: 'mobile', color: '#E91E63' },
  { name: 'AI/ML', slug: 'ai-ml', color: '#673AB7' },
];

// ============================================================================
// SEED DATA - SKILLS (Nodes)
// ============================================================================

interface SkillSeed {
  slug: string;
  name: string;
  description: string;
  category: string; // category slug
  difficulty: Difficulty;
  icon?: string;
  color?: string;
  tags?: string[]; // tag slugs
  sortOrder?: number;
}

const SKILLS: SkillSeed[] = [
  // Root Languages
  { slug: 'python', name: 'Python', description: 'General-purpose programming language, great for beginners and AI/ML', category: 'languages', difficulty: 'BEGINNER', icon: '🐍', color: '#3776AB', tags: ['backend', 'beginner-friendly', 'ai-ml', 'scripting'], sortOrder: 1 },
  { slug: 'javascript', name: 'JavaScript', description: 'The language of the web, runs in browsers and servers', category: 'languages', difficulty: 'BEGINNER', icon: '🟨', color: '#F7DF1E', tags: ['frontend', 'backend', 'fullstack', 'beginner-friendly', 'in-demand'], sortOrder: 2 },
  { slug: 'typescript', name: 'TypeScript', description: 'JavaScript with types, for large-scale applications', category: 'languages', difficulty: 'INTERMEDIATE', icon: '🔷', color: '#3178C6', tags: ['frontend', 'backend', 'fullstack', 'in-demand'], sortOrder: 3 },
  { slug: 'go', name: 'Go', description: 'Fast, simple, and efficient systems programming', category: 'languages', difficulty: 'INTERMEDIATE', icon: '🐹', color: '#00ADD8', tags: ['backend', 'systems', 'in-demand'], sortOrder: 4 },
  { slug: 'rust', name: 'Rust', description: 'Memory-safe systems programming language', category: 'languages', difficulty: 'ADVANCED', icon: '🦀', color: '#DEA584', tags: ['systems', 'backend'], sortOrder: 5 },
  { slug: 'java', name: 'Java', description: 'Enterprise-grade object-oriented language', category: 'languages', difficulty: 'INTERMEDIATE', icon: '☕', color: '#007396', tags: ['backend', 'mobile', 'interview-prep'], sortOrder: 6 },
  { slug: 'cpp', name: 'C++', description: 'High-performance systems and game development', category: 'languages', difficulty: 'ADVANCED', icon: '⚡', color: '#00599C', tags: ['systems', 'interview-prep'], sortOrder: 7 },
  { slug: 'sql', name: 'SQL', description: 'Query language for relational databases', category: 'data', difficulty: 'BEGINNER', icon: '🗃️', color: '#336791', tags: ['backend', 'beginner-friendly', 'interview-prep'], sortOrder: 1 },
  
  // Python Subskills
  { slug: 'python-basics', name: 'Python Basics', description: 'Variables, types, control flow, functions', category: 'languages', difficulty: 'BEGINNER', tags: ['beginner-friendly'], sortOrder: 1 },
  { slug: 'python-oop', name: 'Python OOP', description: 'Object-oriented programming in Python', category: 'languages', difficulty: 'INTERMEDIATE', sortOrder: 2 },
  { slug: 'python-data-structures', name: 'Python Data Structures', description: 'Lists, dicts, sets, tuples and their operations', category: 'languages', difficulty: 'BEGINNER', tags: ['interview-prep'], sortOrder: 3 },
  { slug: 'python-modules', name: 'Python Modules & Packages', description: 'Creating and using modules, pip, virtual environments', category: 'languages', difficulty: 'INTERMEDIATE', sortOrder: 4 },
  { slug: 'python-async', name: 'Python Async Programming', description: 'Asyncio, async/await, concurrent execution', category: 'languages', difficulty: 'ADVANCED', sortOrder: 5 },
  
  // JavaScript Subskills
  { slug: 'js-basics', name: 'JavaScript Basics', description: 'Variables, types, functions, control flow', category: 'languages', difficulty: 'BEGINNER', tags: ['beginner-friendly'], sortOrder: 1 },
  { slug: 'js-dom', name: 'DOM Manipulation', description: 'Interacting with web page elements', category: 'languages', difficulty: 'BEGINNER', tags: ['frontend'], sortOrder: 2 },
  { slug: 'js-async', name: 'Async JavaScript', description: 'Promises, async/await, fetch API', category: 'languages', difficulty: 'INTERMEDIATE', sortOrder: 3 },
  { slug: 'js-es6', name: 'Modern JavaScript (ES6+)', description: 'Arrow functions, destructuring, modules, classes', category: 'languages', difficulty: 'INTERMEDIATE', sortOrder: 4 },
  { slug: 'js-functional', name: 'Functional JavaScript', description: 'Map, filter, reduce, closures, higher-order functions', category: 'languages', difficulty: 'INTERMEDIATE', tags: ['interview-prep'], sortOrder: 5 },
  
  // Web Technologies
  { slug: 'html', name: 'HTML', description: 'Structure and content of web pages', category: 'web', difficulty: 'BEGINNER', icon: '📄', color: '#E34F26', tags: ['frontend', 'beginner-friendly'], sortOrder: 1 },
  { slug: 'css', name: 'CSS', description: 'Styling and layout of web pages', category: 'web', difficulty: 'BEGINNER', icon: '🎨', color: '#1572B6', tags: ['frontend', 'beginner-friendly'], sortOrder: 2 },
  { slug: 'react', name: 'React', description: 'Component-based UI library by Meta', category: 'web', difficulty: 'INTERMEDIATE', icon: '⚛️', color: '#61DAFB', tags: ['frontend', 'in-demand'], sortOrder: 3 },
  { slug: 'nodejs', name: 'Node.js', description: 'JavaScript runtime for server-side development', category: 'web', difficulty: 'INTERMEDIATE', icon: '🟢', color: '#339933', tags: ['backend', 'fullstack', 'in-demand'], sortOrder: 4 },
  
  // CS Fundamentals
  { slug: 'dsa', name: 'Data Structures & Algorithms', description: 'Core CS fundamentals for efficient problem solving', category: 'cs', difficulty: 'INTERMEDIATE', icon: '🧮', color: '#FF5722', tags: ['interview-prep'], sortOrder: 1 },
  { slug: 'oop-concepts', name: 'Object-Oriented Programming', description: 'Classes, inheritance, polymorphism, encapsulation', category: 'cs', difficulty: 'INTERMEDIATE', icon: '🏛️', color: '#9C27B0', tags: ['interview-prep'], sortOrder: 2 },
  
  // DSA Subskills
  { slug: 'arrays-strings', name: 'Arrays & Strings', description: 'Fundamental data structures and operations', category: 'cs', difficulty: 'BEGINNER', tags: ['interview-prep'], sortOrder: 1 },
  { slug: 'linked-lists', name: 'Linked Lists', description: 'Singly and doubly linked lists', category: 'cs', difficulty: 'INTERMEDIATE', tags: ['interview-prep'], sortOrder: 2 },
  { slug: 'trees-graphs', name: 'Trees & Graphs', description: 'Binary trees, BST, graph traversal', category: 'cs', difficulty: 'INTERMEDIATE', tags: ['interview-prep'], sortOrder: 3 },
  { slug: 'sorting-searching', name: 'Sorting & Searching', description: 'Common algorithms and their complexities', category: 'cs', difficulty: 'INTERMEDIATE', tags: ['interview-prep'], sortOrder: 4 },
  { slug: 'dynamic-programming', name: 'Dynamic Programming', description: 'Optimization technique for overlapping subproblems', category: 'cs', difficulty: 'ADVANCED', tags: ['interview-prep'], sortOrder: 5 },
];

// ============================================================================
// SEED DATA - EDGES (Relationships)
// ============================================================================

interface EdgeSeed {
  source: string; // source skill slug
  target: string; // target skill slug
  type: SkillEdgeType;
  isStrict?: boolean;
  strength?: number;
}

const EDGES: EdgeSeed[] = [
  // Python hierarchy (SUBSKILL_OF points TO parent)
  { source: 'python-basics', target: 'python', type: 'SUBSKILL_OF' },
  { source: 'python-oop', target: 'python', type: 'SUBSKILL_OF' },
  { source: 'python-data-structures', target: 'python', type: 'SUBSKILL_OF' },
  { source: 'python-modules', target: 'python', type: 'SUBSKILL_OF' },
  { source: 'python-async', target: 'python', type: 'SUBSKILL_OF' },
  
  // JavaScript hierarchy
  { source: 'js-basics', target: 'javascript', type: 'SUBSKILL_OF' },
  { source: 'js-dom', target: 'javascript', type: 'SUBSKILL_OF' },
  { source: 'js-async', target: 'javascript', type: 'SUBSKILL_OF' },
  { source: 'js-es6', target: 'javascript', type: 'SUBSKILL_OF' },
  { source: 'js-functional', target: 'javascript', type: 'SUBSKILL_OF' },
  
  // DSA hierarchy
  { source: 'arrays-strings', target: 'dsa', type: 'SUBSKILL_OF' },
  { source: 'linked-lists', target: 'dsa', type: 'SUBSKILL_OF' },
  { source: 'trees-graphs', target: 'dsa', type: 'SUBSKILL_OF' },
  { source: 'sorting-searching', target: 'dsa', type: 'SUBSKILL_OF' },
  { source: 'dynamic-programming', target: 'dsa', type: 'SUBSKILL_OF' },
  
  // Prerequisites (source REQUIRES target)
  { source: 'python-oop', target: 'python-basics', type: 'PREREQUISITE', isStrict: true },
  { source: 'python-async', target: 'python-basics', type: 'PREREQUISITE', isStrict: true },
  { source: 'python-modules', target: 'python-basics', type: 'PREREQUISITE', isStrict: false },
  
  { source: 'js-async', target: 'js-basics', type: 'PREREQUISITE', isStrict: true },
  { source: 'js-es6', target: 'js-basics', type: 'PREREQUISITE', isStrict: true },
  { source: 'js-functional', target: 'js-basics', type: 'PREREQUISITE', isStrict: true },
  { source: 'js-dom', target: 'js-basics', type: 'PREREQUISITE', isStrict: false },
  
  { source: 'typescript', target: 'javascript', type: 'PREREQUISITE', isStrict: true },
  { source: 'react', target: 'javascript', type: 'PREREQUISITE', isStrict: true },
  { source: 'react', target: 'html', type: 'PREREQUISITE', isStrict: true },
  { source: 'react', target: 'css', type: 'PREREQUISITE', isStrict: false },
  { source: 'nodejs', target: 'javascript', type: 'PREREQUISITE', isStrict: true },
  
  { source: 'linked-lists', target: 'arrays-strings', type: 'PREREQUISITE', isStrict: false },
  { source: 'trees-graphs', target: 'linked-lists', type: 'PREREQUISITE', isStrict: false },
  { source: 'dynamic-programming', target: 'arrays-strings', type: 'PREREQUISITE', isStrict: true },
  
  // BUILDS_ON relationships (source EXTENDS target)
  { source: 'typescript', target: 'javascript', type: 'BUILDS_ON', strength: 1.0 },
  { source: 'react', target: 'js-es6', type: 'BUILDS_ON', strength: 0.8 },
  { source: 'nodejs', target: 'js-async', type: 'BUILDS_ON', strength: 0.9 },
  
  // RELATED relationships (bidirectional conceptually)
  { source: 'python', target: 'javascript', type: 'RELATED', strength: 0.6 },
  { source: 'go', target: 'python', type: 'RELATED', strength: 0.5 },
  { source: 'rust', target: 'cpp', type: 'RELATED', strength: 0.8 },
  { source: 'java', target: 'cpp', type: 'RELATED', strength: 0.6 },
  { source: 'python-oop', target: 'oop-concepts', type: 'RELATED', strength: 0.9 },
  { source: 'java', target: 'oop-concepts', type: 'RELATED', strength: 0.9 },
  
  // COMPLEMENTS relationships
  { source: 'html', target: 'css', type: 'COMPLEMENTS', strength: 1.0 },
  { source: 'react', target: 'typescript', type: 'COMPLEMENTS', strength: 0.9 },
  { source: 'nodejs', target: 'sql', type: 'COMPLEMENTS', strength: 0.7 },
];

// ============================================================================
// SEED FUNCTION
// ============================================================================

async function seedSkills() {
  console.log('🌱 Starting skill graph seeding...\n');
  
  // 1. Create categories
  console.log('📁 Creating categories...');
  const categoryMap = new Map<string, string>();
  
  for (const cat of CATEGORIES) {
    const created = await prisma.skillCategory.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: cat,
    });
    categoryMap.set(cat.slug, created.id);
    console.log(`  ✓ ${cat.name}`);
  }
  
  // 2. Create tags
  console.log('\n🏷️  Creating tags...');
  const tagMap = new Map<string, string>();
  
  for (const tag of TAGS) {
    const created = await prisma.skillTag.upsert({
      where: { slug: tag.slug },
      create: tag,
      update: tag,
    });
    tagMap.set(tag.slug, created.id);
    console.log(`  ✓ ${tag.name}`);
  }
  
  // 3. Create skills
  console.log('\n🎯 Creating skills...');
  const skillMap = new Map<string, string>();
  
  for (const skill of SKILLS) {
    const categoryId = categoryMap.get(skill.category);
    if (!categoryId) {
      console.error(`  ✗ Category not found for ${skill.name}: ${skill.category}`);
      continue;
    }
    
    const normalizedName = skill.name.toLowerCase().trim();
    
    const tagConnections = skill.tags?.map((slug) => {
      const tagId = tagMap.get(slug);
      return tagId ? { id: tagId } : null;
    }).filter(Boolean) as { id: string }[] || [];
    
    const created = await prisma.skill.upsert({
      where: { slug: skill.slug },
      create: {
        slug: skill.slug,
        name: skill.name,
        normalizedName,
        description: skill.description,
        icon: skill.icon,
        color: skill.color,
        difficulty: skill.difficulty,
        categoryId,
        sortOrder: skill.sortOrder ?? 0,
        isPublished: true,
        isCanonical: true,
        tags: {
          connect: tagConnections,
        },
      },
      update: {
        name: skill.name,
        normalizedName,
        description: skill.description,
        icon: skill.icon,
        color: skill.color,
        difficulty: skill.difficulty,
        sortOrder: skill.sortOrder ?? 0,
        isPublished: true,
        tags: {
          set: tagConnections,
        },
      },
    });
    
    skillMap.set(skill.slug, created.id);
    console.log(`  ✓ ${skill.name}`);
  }
  
  // 4. Create edges
  console.log('\n🔗 Creating skill edges...');
  let edgeCount = 0;
  
  for (const edge of EDGES) {
    const sourceId = skillMap.get(edge.source);
    const targetId = skillMap.get(edge.target);
    
    if (!sourceId || !targetId) {
      console.error(`  ✗ Skills not found for edge: ${edge.source} → ${edge.target}`);
      continue;
    }
    
    try {
      await prisma.skillEdge.upsert({
        where: {
          sourceId_targetId_edgeType: {
            sourceId,
            targetId,
            edgeType: edge.type,
          },
        },
        create: {
          sourceId,
          targetId,
          edgeType: edge.type,
          isStrict: edge.isStrict ?? false,
          strength: edge.strength ?? 1.0,
        },
        update: {
          isStrict: edge.isStrict ?? false,
          strength: edge.strength ?? 1.0,
        },
      });
      edgeCount++;
    } catch (error) {
      console.error(`  ✗ Failed to create edge: ${edge.source} → ${edge.target}`, error);
    }
  }
  console.log(`  ✓ Created ${edgeCount} edges`);
  
  // Summary
  console.log('\n📊 Seed Summary:');
  console.log(`  Categories: ${CATEGORIES.length}`);
  console.log(`  Tags: ${TAGS.length}`);
  console.log(`  Skills: ${SKILLS.length}`);
  console.log(`  Edges: ${edgeCount}`);
  console.log('\n✅ Skill graph seeding complete!');
}

// ============================================================================
// MAIN
// ============================================================================

seedSkills()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
