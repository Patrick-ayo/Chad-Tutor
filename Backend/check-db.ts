import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.studyTask.findMany({
    take: 5,
    orderBy: { scheduledDate: 'desc' },
    select: { id: true, title: true, goalId: true, scheduledDate: true, status: true, topicId: true }
  });
  console.log("Latest Tasks:", JSON.stringify(tasks, null, 2));
  
  const allTasksCount = await prisma.studyTask.count();
  console.log("Total tasks in DB:", allTasksCount);
}

main().catch(console.error).finally(() => prisma.$disconnect());
