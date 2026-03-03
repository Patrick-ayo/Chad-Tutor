const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('=== TABLES & DATA LOCATION ===\n');
    
    // Skill table info
    const skillCount = await prisma.skill.count();
    console.log('1. TABLE: "Skill"');
    console.log(`   Location: PostgreSQL chad_tutor database`);
    console.log(`   Records: ${skillCount}`);
    console.log(`   Contains: All skills from all roadmaps`);
    console.log(`   Key columns: id, slug, name, description, difficulty, roadmapId, categoryId\n`);
    
    // Roadmap table info
    const roadmapCount = await prisma.roadmap.count();
    console.log('2. TABLE: "Roadmap"');
    console.log(`   Location: PostgreSQL chad_tutor database`);
    console.log(`   Records: ${roadmapCount}`);
    console.log(`   Contains: 8 roadmaps (Backend, PostgreSQL DBA, AI Engineer, etc.)`);
    console.log(`   Key columns: id, name, slug, description, icon, color, isPublished, rootSkillId\n`);
    
    // SkillEdge table info
    const edgeCount = await prisma.skillEdge.count();
    console.log('3. TABLE: "SkillEdge"');
    console.log(`   Location: PostgreSQL chad_tutor database`);
    console.log(`   Records: ${edgeCount}`);
    console.log(`   Contains: Relationships between skills (prerequisites, subskills, etc.)`);
    console.log(`   Key columns: id, sourceId, targetId, edgeType, strength, isStrict\n`);
    
    // SkillCategory table info
    const categoryCount = await prisma.skillCategory.count();
    console.log('4. TABLE: "SkillCategory"');
    console.log(`   Location: PostgreSQL chad_tutor database`);
    console.log(`   Records: ${categoryCount}`);
    console.log(`   Contains: Categories for grouping skills`);
    console.log(`   Key columns: id, name, slug, description\n`);
    
    // Sample data from each table
    console.log('=== SAMPLE DATA ===\n');
    
    const sampleSkill = await prisma.skill.findFirst({ where: { difficulty: 'BEGINNER' } });
    console.log('→ Sample Skill:');
    console.log(`  Name: ${sampleSkill?.name}`);
    console.log(`  Slug: ${sampleSkill?.slug}`);
    console.log(`  Difficulty: ${sampleSkill?.difficulty}\n`);
    
    const sampleRoadmap = await prisma.roadmap.findFirst();
    console.log('→ Sample Roadmap:');
    console.log(`  Name: ${sampleRoadmap?.name}`);
    console.log(`  Slug: ${sampleRoadmap?.slug}\n`);
    
    const sampleEdge = await prisma.skillEdge.findFirst({ include: { source: true, target: true } });
    console.log('→ Sample Skill Edge:');
    console.log(`  Source: ${sampleEdge?.source?.name}`);
    console.log(`  Target: ${sampleEdge?.target?.name}`);
    console.log(`  Type: ${sampleEdge?.edgeType}\n`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
