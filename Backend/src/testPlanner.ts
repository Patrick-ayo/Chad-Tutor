import { PrismaClient } from '@prisma/client';
import { getPlannerSnapshot } from './services/planner.service';
import { taskRepo } from './repositories';

const prisma = new PrismaClient();

async function run() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found");
    return;
  }
  const snapshot = await getPlannerSnapshot(user.id);
  console.log("Today's Tasks:", JSON.stringify(snapshot.scheduleDays[0].tasks, null, 2));
  console.log("Today's Total Tasks:", snapshot.scheduleDays[0].tasks.length);
}

run().catch(console.error).finally(() => prisma.$disconnect());
