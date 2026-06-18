const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper date functions matching backend services
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

(async () => {
  try {
    const userId = '4e9f42dc-11ef-4031-b2cb-c061a4bc59b3'; // dhumeyash@gmail.com
    
    // 1. Clean existing goals/tasks for this user to start fresh
    await prisma.studyTask.deleteMany({ where: { userId } });
    await prisma.goal.deleteMany({ where: { userId } });
    
    // 2. Create Goal
    const goal = await prisma.goal.create({
      data: {
        userId,
        name: 'PostgreSQL Performance Optimization',
        description: 'Master indexing and query tuning',
        status: 'ACTIVE',
        deadline: addDays(new Date(), 10),
      }
    });
    
    // 3. Create Study Tasks
    const today = new Date();
    // Task 1 scheduled for today (UTC midnight)
    const taskDateToday = new Date(today);
    taskDateToday.setUTCHours(0, 0, 0, 0);
    
    const task1 = await prisma.studyTask.create({
      data: {
        userId,
        goalId: goal.id,
        title: 'Watch Indexing basics',
        description: 'Learn B-Tree structures',
        scheduledDate: taskDateToday,
        estimatedMinutes: 30,
        status: 'SCHEDULED',
        priority: 'HIGH',
        roadmapId: 'roadmap-postgresql',
        topicId: 'indexing',
        subtopicId: 'watch',
        sequenceNumber: 1,
        videoId: 'idx-video-1',
        videoUrl: 'https://www.youtube.com/watch?v=idx-video-1',
        videoTitle: 'B-Tree Indexing in PostgreSQL',
      }
    });

    // Task 2 scheduled for today (server local time midnight representation)
    const taskDateLocal = startOfDay(today);
    const task2 = await prisma.studyTask.create({
      data: {
        userId,
        goalId: goal.id,
        title: 'Watch Partitioning',
        description: 'Table partitioning concepts',
        scheduledDate: taskDateLocal,
        estimatedMinutes: 45,
        status: 'SCHEDULED',
        priority: 'HIGH',
        roadmapId: 'roadmap-postgresql',
        topicId: 'partitioning',
        subtopicId: 'watch',
        sequenceNumber: 2,
        videoId: 'part-video-1',
        videoUrl: 'https://www.youtube.com/watch?v=part-video-1',
        videoTitle: 'PostgreSQL Partitioning Guide',
      }
    });

    console.log('=== SEEDED TASKS IN DATABASE ===');
    const dbTasks = await prisma.studyTask.findMany({ where: { userId } });
    dbTasks.forEach((t, i) => {
      console.log(`Task ${i+1}:`);
      console.log(`  taskId: ${t.id}`);
      console.log(`  title: ${t.title}`);
      console.log(`  scheduledDate: ${t.scheduledDate.toISOString()} (Local: ${t.scheduledDate.toString()})`);
      console.log(`  status: ${t.status}`);
      console.log(`  roadmapId: ${t.roadmapId}`);
      console.log(`  goalId: ${t.goalId}`);
    });

    // 4. Run Schedule Page Query Simulation (getPlannerSnapshot)
    console.log('\n=== RUNNING SCHEDULE PAGE QUERY SIMULATION (getPlannerSnapshot) ===');
    const rangeStart = startOfDay(addDays(today, -2));
    const rangeEnd = endOfDay(addDays(today, 10));
    
    console.log(`Range queried: ${rangeStart.toISOString()} to ${rangeEnd.toISOString()}`);
    const scheduleTasks = await prisma.studyTask.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: rangeStart,
          lte: rangeEnd,
        },
      },
    });
    
    console.log(`Schedule query returned ${scheduleTasks.length} tasks:`);
    scheduleTasks.forEach(t => console.log(`  - ${t.title} (${t.scheduledDate.toISOString()})`));

    // 5. Run Session Page Query Simulation (getTasksForDate)
    console.log('\n=== RUNNING SESSION PAGE QUERY SIMULATION (getTasksForDate) ===');
    // Simulate frontend passing new Date().toISOString()
    const clientDateIso = today.toISOString();
    const dateParsed = new Date(clientDateIso);
    const dayStart = startOfDay(dateParsed);
    const dayEnd = endOfDay(dateParsed);
    
    console.log(`Client Date ISO sent: ${clientDateIso}`);
    console.log(`Range queried: ${dayStart.toISOString()} to ${dayEnd.toISOString()}`);
    const sessionTasks = await prisma.studyTask.findMany({
      where: {
        userId,
        scheduledDate: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });
    
    console.log(`Session query returned ${sessionTasks.length} tasks:`);
    sessionTasks.forEach(t => console.log(`  - ${t.title} (${t.scheduledDate.toISOString()})`));

    // 6. Timezone shifts on client parsing
    console.log('\n=== TIMEZONE SHIFTS ON CLIENT SIDE PARSING ===');
    const dayDateUTCStr = '2026-06-09T00:00:00.000Z'; // Server ISO string representation of UTC midnight
    const dayDateUTC = new Date(dayDateUTCStr);
    
    console.log(`Server returns day.date: "${dayDateUTCStr}"`);
    console.log(`Client creates Date: new Date(day.date)`);
    console.log(`  dayDate.toDateString() in client timezone: "${dayDateUTC.toDateString()}"`);
    
    const clientToday = new Date();
    clientToday.setHours(0,0,0,0);
    console.log(`Client todayText: "${clientToday.toDateString()}"`);
    console.log(`Match? dayDate.toDateString() === todayText: ${dayDateUTC.toDateString() === clientToday.toDateString()}`);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error tracing user data:', error.message);
    process.exit(1);
  }
})();
