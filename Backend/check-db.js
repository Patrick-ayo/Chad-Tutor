const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const skills = await prisma.skill.count();
    const roadmaps = await prisma.roadmap.count();
    const edges = await prisma.skillEdge.count();
    
    console.log('=== DATABASE STATS ===');
    console.log('Skills:', skills);
    console.log('Roadmaps:', roadmaps);
    console.log('Edges:', edges);
    
    const allRoadmaps = await prisma.roadmap.findMany({ 
      select: { name: true, slug: true } 
    });
    
    console.log('\n=== ROADMAPS IN DATABASE ===');
    allRoadmaps.forEach(r => console.log(`  ✓ ${r.name} (${r.slug})`));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
