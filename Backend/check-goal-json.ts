import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const goal = await prisma.goal.findFirst({
    where: { name: 'C++' },
    orderBy: { createdAt: 'desc' }
  });
  console.log("Detailed Roadmap JSON:", goal?.detailedRoadmap ? JSON.stringify(goal.detailedRoadmap).substring(0, 500) : null);
}

main().catch(console.error).finally(() => prisma.$disconnect());
