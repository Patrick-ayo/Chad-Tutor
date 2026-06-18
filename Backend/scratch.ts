import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const goals = await prisma.goal.findMany({ include: { tasks: true } });
  console.log(`Found ${goals.length} goals.`);
  for (const g of goals) {
    console.log(`Goal: ${g.id} - ${g.name}`);
    console.log(`  Tasks: ${g.tasks.length}`);
    const tasksWithVideo = g.tasks.filter(t => t.videoId);
    console.log(`  Tasks with video: ${tasksWithVideo.length}`);
  }
}

main().finally(() => prisma.$disconnect());
