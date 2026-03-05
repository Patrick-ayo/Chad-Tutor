const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== Render Database Status ===\n');
  
  const tables = [
    ['SkillCategory', () => prisma.skillCategory.count()],
    ['SkillTag', () => prisma.skillTag.count()],
    ['Roadmap', () => prisma.roadmap.count()],
    ['Skill', () => prisma.skill.count()],
    ['SkillEdge', () => prisma.skillEdge.count()],
  ];
  
  for (const [name, countFn] of tables) {
    const count = await countFn();
    console.log(`${name.padEnd(20)} ${count}`);
  }
  
  console.log('\n=== Expected (from local) ===');
  console.log('SkillCategory        28');
  console.log('SkillTag             10');
  console.log('Roadmap              25');
  console.log('Skill                2447');
  console.log('SkillEdge            2332');
  
  await prisma.$disconnect();
}

main().catch(console.error);
