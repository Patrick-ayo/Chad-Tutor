import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.studyTask.count({
    where: { goalId: { not: null } }
  });
  console.log("Total tasks with goalId:", count);

  const groups = await prisma.studyTask.groupBy({
    by: ['goalId'],
    _count: { id: true },
    having: { id: { _count: { gt: 0 } } }
  });
  console.log("Goals with tasks:", groups);
}

main().catch(console.error).finally(() => prisma.$disconnect());
