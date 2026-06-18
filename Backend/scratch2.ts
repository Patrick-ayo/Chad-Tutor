import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tenMinutesAgo = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
  const tasks = await prisma.studyTask.findMany({
    where: { createdAt: { gte: tenMinutesAgo } },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`Found ${tasks.length} tasks created recently.`);
  if (tasks.length > 0) {
    console.log(tasks[0]);
  }
}

main().finally(() => prisma.$disconnect());
