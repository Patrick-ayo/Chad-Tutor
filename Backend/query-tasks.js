const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const users = await prisma.user.findMany();
    console.log('=== USERS ===');
    console.log(users.map(u => ({ id: u.id, email: u.email, role: u.role })));

    const goalsCount = await prisma.goal.count();
    const tasksCount = await prisma.studyTask.count();
    console.log(`Goals count: ${goalsCount}, Tasks count: ${tasksCount}`);

    if (tasksCount > 0) {
      const tasks = await prisma.studyTask.findMany();
      console.log('Unique UserIds in StudyTask:', Array.from(new Set(tasks.map(t => t.userId))));
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
