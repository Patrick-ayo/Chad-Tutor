import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const goal = await prisma.goal.findFirst({
    where: { name: 'C++' },
    orderBy: { createdAt: 'desc' }
  });
  console.log("Goal detailedRoadmap:");
  console.dir(goal?.detailedRoadmap, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
