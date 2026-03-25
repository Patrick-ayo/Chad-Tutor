/**
 * Session Planner Seed Script
 *
 * Creates demo user playlists/tasks to validate planner scheduling and rescheduling.
 *
 * Usage:
 *   npx ts-node prisma/seed/session-planner.seed.ts
 */

import { Prisma, PrismaClient, TaskPriority, TaskStatus } from '@prisma/client';

const prisma = new PrismaClient();

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo.planner@chadtutor.local' },
    update: { name: 'Planner Demo User' },
    create: {
      clerkId: 'demo_planner_clerk',
      email: 'demo.planner@chadtutor.local',
      name: 'Planner Demo User',
      timezone: 'UTC',
      roles: ['LEARNER'],
    },
  });

  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {
      activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      dailyMinutes: {
        monday: 120,
        tuesday: 90,
        wednesday: 120,
        thursday: 90,
        friday: 120,
        saturday: 150,
      },
      sessionDuration: 30,
      rescheduleMode: 'AUTO',
    },
    create: {
      userId: user.id,
      activeDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
      dailyMinutes: {
        monday: 120,
        tuesday: 90,
        wednesday: 120,
        thursday: 90,
        friday: 120,
        saturday: 150,
      },
      sessionDuration: 30,
      rescheduleMode: 'AUTO',
    },
  });

  const skillIds = await prisma.skill.findMany({
    where: { isPublished: true },
    select: { id: true },
    take: 3,
  });

  const today = new Date();
  const playlistInputs = [
    {
      name: 'Data Structures Masterclass',
      source: 'youtube',
      externalId: 'PL-DS-001',
      externalUrl: 'https://youtube.com/playlist?list=PL-DS-001',
      items: [
        {
          title: 'Arrays and Linked Lists',
          estimatedMinutes: 35,
          keyPoints: ['Array traversal', 'Linked list insertion'],
          outcomes: ['Implement linked lists', 'Choose right data structure'],
        },
        {
          title: 'Stacks and Queues',
          estimatedMinutes: 30,
          keyPoints: ['LIFO vs FIFO', 'Queue operations'],
          outcomes: ['Apply stack patterns', 'Build queue-driven flows'],
        },
      ],
    },
    {
      name: 'Database Systems Essentials',
      source: 'youtube',
      externalId: 'PL-DB-001',
      externalUrl: 'https://youtube.com/playlist?list=PL-DB-001',
      items: [
        {
          title: 'SQL Joins Deep Dive',
          estimatedMinutes: 40,
          keyPoints: ['Inner vs outer joins', 'Join planning'],
          outcomes: ['Write efficient joins', 'Debug join issues'],
        },
        {
          title: 'Normalization and Indexing',
          estimatedMinutes: 45,
          keyPoints: ['3NF design', 'Index strategies'],
          outcomes: ['Normalize schemas', 'Pick indexes with intent'],
        },
      ],
    },
    {
      name: 'Algorithms Problem Solving',
      source: 'youtube',
      externalId: 'PL-ALGO-001',
      externalUrl: 'https://youtube.com/playlist?list=PL-ALGO-001',
      items: [
        {
          title: 'Dynamic Programming Intro',
          estimatedMinutes: 50,
          keyPoints: ['State definition', 'Memoization'],
          outcomes: ['Solve classic DP questions', 'Optimize time complexity'],
        },
        {
          title: 'Graph Traversal Patterns',
          estimatedMinutes: 35,
          keyPoints: ['BFS vs DFS', 'Visited set strategy'],
          outcomes: ['Model graph problems', 'Traverse safely under constraints'],
        },
      ],
    },
  ];

  const createdPlaylists: string[] = [];

  for (const [index, playlist] of playlistInputs.entries()) {
    const created = await prisma.learningPlaylist.create({
      data: {
        userId: user.id,
        name: playlist.name,
        externalSource: playlist.source,
        externalId: playlist.externalId,
        externalUrl: playlist.externalUrl,
        estimatedHours: Number((playlist.items.reduce((sum, item) => sum + item.estimatedMinutes, 0) / 60).toFixed(1)),
        resourceCount: playlist.items.length,
        items: {
          create: playlist.items.map((item, itemIndex) => ({
            title: item.title,
            sequence: itemIndex,
            estimatedMinutes: item.estimatedMinutes,
            keyPoints: item.keyPoints,
            learningOutcomes: item.outcomes,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    createdPlaylists.push(created.id);

    const skill = skillIds[index];
    if (skill) {
      await prisma.skillPlaylistLink.upsert({
        where: {
          userId_skillId_playlistId_resourceType: {
            userId: user.id,
            skillId: skill.id,
            playlistId: created.id,
            resourceType: 'primary',
          },
        },
        update: {
          sequence: index,
        },
        create: {
          userId: user.id,
          skillId: skill.id,
          playlistId: created.id,
          resourceType: 'primary',
          sequence: index,
        },
      });
    }

    for (const [itemIndex, item] of created.items.entries()) {
      const scheduledDate = addDays(today, index + itemIndex);
      await prisma.studyTask.create({
        data: {
          userId: user.id,
          playlistId: created.id,
          playlistItemId: item.id,
          skillId: skillIds[index]?.id,
          title: item.title,
          scheduledDate,
          estimatedMinutes: item.estimatedMinutes ?? 25,
          priority: itemIndex === 0 ? TaskPriority.HIGH : TaskPriority.MEDIUM,
          status: TaskStatus.SCHEDULED,
          keyPoints: item.keyPoints === null ? undefined : (item.keyPoints as Prisma.InputJsonValue),
          learningOutcomes:
            item.learningOutcomes === null
              ? undefined
              : (item.learningOutcomes as Prisma.InputJsonValue),
        },
      });
    }
  }

  // Create a missed high-priority task to exercise rescheduler rules.
  const pastDate = addDays(today, -1);
  await prisma.studyTask.create({
    data: {
      userId: user.id,
      title: 'High Priority Catch-up: AVL Rotations',
      scheduledDate: pastDate,
      estimatedMinutes: 45,
      priority: TaskPriority.HIGH,
      status: TaskStatus.MISSED,
      rescheduledReason: 'Seeded missed task for reschedule validation',
      keyPoints: ['LL/LR/RR/RL cases'],
      learningOutcomes: ['Balance BST efficiently'],
    },
  });

  // Seed one quiz attempt + cache for dummy test access.
  const attempt = await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      questionsCount: 10,
      correctCount: 7,
      score: 70,
      metadata: { source: 'seed', type: 'dummy' },
    },
  });

  const existingGeneralCache = await prisma.testResultCache.findFirst({
    where: {
      userId: user.id,
      skillId: null,
    },
  });

  if (existingGeneralCache) {
    await prisma.testResultCache.update({
      where: { id: existingGeneralCache.id },
      data: {
        latestScore: attempt.score,
        latestAttemptAt: attempt.completedAt,
        totalAttempts: 1,
        averageScore: attempt.score,
        bestScore: attempt.score,
        expiresAt: addDays(today, 1),
        lastCachedAt: new Date(),
      },
    });
  } else {
    await prisma.testResultCache.create({
      data: {
        userId: user.id,
        skillId: null,
        latestScore: attempt.score,
        latestAttemptAt: attempt.completedAt,
        totalAttempts: 1,
        averageScore: attempt.score,
        bestScore: attempt.score,
        expiresAt: addDays(today, 1),
      },
    });
  }

  console.log('Session planner seed completed');
  console.log(`User: ${user.email}`);
  console.log(`Playlists: ${createdPlaylists.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
