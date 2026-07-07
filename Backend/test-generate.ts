import { generateDetailedRoadmapForUser } from './src/services/detailedRoadmap.service';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user");

  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Test Goal for Roadmap",
      deadline: new Date(),
    }
  });

  console.log("Goal created:", goal.id);

  try {
    const res = await generateDetailedRoadmapForUser({
      userId: user.id,
      goalId: goal.id,
      goalName: "Test Goal for Roadmap",
      topicName: "TypeScript",
      videos: [
        { id: "vid1", title: "TS intro", durationSeconds: 600 }
      ],
      startDate: new Date().toISOString()
    });
    console.log("Success! Created tasks:", res.plannerTasksCreated);
  } catch (err) {
    console.error("Error generating roadmap:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
