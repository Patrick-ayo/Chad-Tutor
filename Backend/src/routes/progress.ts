import { Router, Request, Response } from 'express';
import { asyncHandler, requireUser } from '../middleware';
import { prisma } from '../repositories/base.repo';

const router = Router();

router.get('/summary', requireUser, asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const tasks = await prisma.studyTask.findMany({
    where: { userId },
  });

  let totalVideos = 0;
  let watchedVideos = 0;
  let totalMinutes = 0;
  let completedMinutes = 0;

  const subjectsMap: Record<string, any> = {};
  const dailyActivityMap: Record<string, { planned: number; completed: number; taskScheduled: boolean }> = {};

  const todayStr = new Date().toISOString().split('T')[0];
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89); // 90 days including today

  // Initialize last 90 days
  for (let i = 0; i < 90; i++) {
    const d = new Date(ninetyDaysAgo);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    dailyActivityMap[dateStr] = { planned: 0, completed: 0, taskScheduled: false };
  }

  // Active days tracking for pace
  const activeDaysSet = new Set<string>();
  const plannedDaysSet = new Set<string>();

  tasks.forEach(task => {
    // Determine if it's a video task
    const isVideo = !!(task.videoId || task.videoUrl);
    const isCompleted = task.status === 'COMPLETED';
    const taskCompletedMins = isCompleted
      ? (task.completedDurationMinutes ?? task.estimatedMinutes)
      : 0;

    totalMinutes += task.estimatedMinutes;
    completedMinutes += taskCompletedMins;

    if (isVideo) {
      totalVideos++;
      if (isCompleted) {
        watchedVideos++;
      }
    }

    // Subjects logic
    const tId = task.topicId || 'unknown_topic';
    if (!subjectsMap[tId]) {
      // Try to format topic ID into a human-readable name
      const formattedName = tId
        .split('-')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
      
      subjectsMap[tId] = {
        topicId: tId,
        topicName: tId === 'unknown_topic' ? 'Unknown Topic' : formattedName,
        totalVideos: 0,
        watchedVideos: 0,
        totalMinutes: 0,
        completedMinutes: 0,
      };
    }

    subjectsMap[tId].totalMinutes += task.estimatedMinutes;
    subjectsMap[tId].completedMinutes += taskCompletedMins;
    if (isVideo) {
      subjectsMap[tId].totalVideos++;
      if (isCompleted) {
        subjectsMap[tId].watchedVideos++;
      }
    }

    // Daily Activity Map (based on scheduledDate)
    const taskDateStr = new Date(task.scheduledDate).toISOString().split('T')[0];
    
    // We add planned minutes to the scheduled date
    if (dailyActivityMap[taskDateStr]) {
      dailyActivityMap[taskDateStr].taskScheduled = true;
      dailyActivityMap[taskDateStr].planned += task.estimatedMinutes;
    }
    
    // We track total planned days globally
    plannedDaysSet.add(taskDateStr);

    if (isCompleted) {
      const compDateStr = task.completedAt
        ? new Date(task.completedAt).toISOString().split('T')[0]
        : taskDateStr; // fallback to scheduled date if no completedAt
        
      if (dailyActivityMap[compDateStr]) {
        dailyActivityMap[compDateStr].completed += taskCompletedMins;
      }
      // activeDays logic
      if (taskCompletedMins > 0) {
         activeDaysSet.add(compDateStr);
      }
    }
  });

  // Calculate subjects percent and status
  const subjects = Object.values(subjectsMap).map(subj => {
    const percent = subj.totalMinutes > 0 ? Math.round((subj.completedMinutes / subj.totalMinutes) * 100) : 0;
    let status = 'not_started';
    if (percent === 100) {
      status = 'completed';
    } else if (percent > 0) {
      status = 'in_progress';
    }
    return {
      ...subj,
      percent,
      status,
    };
  });

  // Daily activity map formatting
  const dailyActivity = Object.entries(dailyActivityMap).map(([date, data]) => {
    let finalIntensity = 0;
    if (!data.taskScheduled && data.completed === 0) {
      finalIntensity = 0;
    } else if (data.completed === 0 && data.planned > 0) {
      finalIntensity = 1;
    } else if (data.completed < data.planned * 0.5) {
      finalIntensity = 2;
    } else if (data.completed < data.planned) {
      finalIntensity = 3;
    } else {
      finalIntensity = 4;
    }

    return {
      date,
      plannedMinutes: data.planned,
      completedMinutes: data.completed,
      intensity: finalIntensity as 0 | 1 | 2 | 3 | 4,
    };
  }).sort((a, b) => a.date.localeCompare(b.date));

  // Pace metrics
  const plannedPerDay = plannedDaysSet.size > 0 ? Math.round(totalMinutes / plannedDaysSet.size) : 0;
  const actualPerDay = activeDaysSet.size > 0 ? Math.round(completedMinutes / activeDaysSet.size) : 0;
  const ratio = plannedPerDay > 0 ? (actualPerDay / plannedPerDay) : 1;

  let trend = 'on_track';
  if (ratio >= 1.2) trend = 'ahead';
  else if (ratio >= 0.8) trend = 'on_track';
  else if (ratio >= 0.5) trend = 'behind';
  else trend = 'critical';

  // Projected Completion
  const remainingMinutes = totalMinutes - completedMinutes;
  let daysNeeded = 0;
  if (remainingMinutes > 0) {
    if (actualPerDay > 0) {
      daysNeeded = Math.ceil(remainingMinutes / actualPerDay);
    } else if (plannedPerDay > 0) {
      daysNeeded = Math.ceil(remainingMinutes / plannedPerDay);
    } else {
      daysNeeded = Math.ceil(remainingMinutes / 60); // fallback 1h/day
    }
  }

  const projectedDate = new Date();
  projectedDate.setDate(projectedDate.getDate() + daysNeeded);

  // Original deadline from goal? Or latest scheduled task date?
  let originalDeadline = new Date().toISOString().split('T')[0];
  if (tasks.length > 0) {
    const dates = tasks.map(t => new Date(t.scheduledDate).getTime());
    originalDeadline = new Date(Math.max(...dates)).toISOString().split('T')[0];
  }

  const originalDeadlineDate = new Date(originalDeadline);
  const diffTime = originalDeadlineDate.getTime() - projectedDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const daysAhead = diffDays;

  return res.json({
    totalVideos,
    watchedVideos,
    totalMinutes,
    completedMinutes,
    overallPercent: totalMinutes > 0 ? Math.round((completedMinutes / totalMinutes) * 100) : 0,
    subjects,
    pace: {
      plannedPerDay,
      actualPerDay,
      ratio: Math.round(ratio * 100) / 100,
      trend,
    },
    dailyActivity,
    projectedCompletion: {
      originalDeadline,
      projectedDate: projectedDate.toISOString().split('T')[0],
      daysAhead,
      onTrack: daysAhead >= 0,
    },
  });
}));

export default router;
