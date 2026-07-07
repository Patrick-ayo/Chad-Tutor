import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const goals = await prisma.goal.findMany({
    select: { id: true, name: true, _count: { select: { tasks: true } } }
  });
  console.log("Goals:", JSON.stringify(goals, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
