/**
 * Planner Routes
 */

import { Router, Request, Response } from "express";
import { asyncHandler, requireUser } from "../middleware";
import { plannerService } from "../services";
import { rescheduleMissedTasks, buildTopicQueuesFromDB } from "../services/reschedule.service";
import {
  scheduleMultiTopicTasks,
  resolveMissedTasksMultiTopic,
  buildBufferPoolsFromHistory,
  decayBufferPoolEntries,
} from "../services/scheduler.service";
import { taskRepo, settingsRepo } from "../repositories";

const router = Router();

router.get("/", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const planner = await plannerService.getPlannerSnapshot(req.user!.id);
  return res.json({ planner });
}));

router.post("/generate", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { playlistIds, startDate, horizonDays } = req.body as {
    playlistIds?: string[];
    startDate?: string;
    horizonDays?: number;
  };

  if (!playlistIds || playlistIds.length === 0) {
    return res.status(400).json({
      error: "Bad Request",
      message:
        "playlistIds is required and must contain at least one playlist ID",
    });
  }

  if (
    horizonDays !== undefined &&
    (!Number.isFinite(horizonDays) || horizonDays < 1)
  ) {
    return res.status(400).json({
      error: "Bad Request",
      message: "horizonDays must be a positive number when provided",
    });
  }

  const result = await plannerService.generateScheduleFromPlaylists(req.user!.id, {
    playlistIds,
    startDate,
    horizonDays,
  });

  return res.status(201).json({ result });
}));

router.post("/clear", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const { confirmationText } = req.body as { confirmationText?: string };

  if ((confirmationText ?? "").trim().toLowerCase() !== "clear all") {
    return res.status(400).json({
      error: "Bad Request",
      message: 'Confirmation text must be "clear all"',
    });
  }

  const result = await plannerService.clearPlannerData(req.user!.id);
  return res.json({ result });
}));

router.post(
  "/resolve/:taskId",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const { taskId } = req.params as { taskId: string };
    const { type } = req.body as {
      type?: "push-forward" | "compress" | "convert-revision" | "drop";
    };

    if (!type) {
      return res.status(400).json({
        error: "Bad Request",
        message: "resolution type is required",
      });
    }

    const result = await plannerService.resolveMissedTask(
      req.user!.id,
      taskId,
      type,
    );

    return res.json({ result });
  }),
);

router.post(
  "/resolve-batch",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const { resolutions } = req.body as {
      resolutions?: Array<{
        taskId: string;
        type: "push-forward" | "compress" | "convert-revision" | "drop";
      }>;
    };

    if (!Array.isArray(resolutions) || resolutions.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "resolutions is required and must contain at least one item",
      });
    }

    const invalidResolution = resolutions.find(
      (resolution) =>
        !resolution ||
        typeof resolution.taskId !== "string" ||
        resolution.taskId.trim().length === 0 ||
        ![
          "push-forward",
          "compress",
          "convert-revision",
          "drop",
        ].includes(resolution.type),
    );

    if (invalidResolution) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Each resolution must include a valid taskId and type",
      });
    }

    const result = await plannerService.resolveMissedTasksBatch(
      req.user!.id,
      resolutions,
    );

    return res.json({ result });
  }),
);

router.post("/test/reschedule", requireUser, asyncHandler(async (req, res) => {
  const result = await rescheduleMissedTasks(req.user!.id);
  res.json({ result });
}));

router.post(
  "/resolve-multitopic",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const { missedTaskIds, today } = req.body as { missedTaskIds?: string[]; today?: string };

    if (!Array.isArray(missedTaskIds) || missedTaskIds.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'missedTaskIds is required' });
    }

    const asOf = today ? new Date(today) : new Date();

    const settings = await settingsRepo.findByUserId(req.user!.id);
    const availability = {
      activeDays: settings?.activeDays ?? ['monday','tuesday','wednesday','thursday','friday'],
      minutesPerDay: settings?.dailyMinutes ?? { monday: 60, tuesday: 60, wednesday: 60, thursday: 60, friday: 60, saturday: 0, sunday: 0 },
    } as any;

    // build queues and call resolver
    const queues = await buildTopicQueuesFromDB(req.user!.id);
    const allTasksRaw = (await taskRepo.findByUserAndDateRange(req.user!.id, new Date(asOf.getTime()-1000*60*60*24*365), new Date(asOf.getTime()+1000*60*60*24*365)));
    const allTasks = allTasksRaw.map((t) => ({
      id: t.id,
      taskId: t.playlistItemId ?? undefined,
      title: t.title,
      type: (t.playlistItemId ? 'learn' : 'practice') as any,
      topicId: t.skillId ?? t.goalId ?? undefined,
      subtopicClusterId: undefined,
      scheduledDate: t.scheduledDate,
      deadlineDate: undefined,
      estimatedMinutes: t.estimatedMinutes,
      actualMinutes: t.completedDurationMinutes ?? undefined,
      status: t.status,
      rescheduleCount: t.rescheduleCount,
      originalEstimatedMinutes: undefined,
    }));

    const result = resolveMissedTasksMultiTopic(allTasks, missedTaskIds, asOf, availability);

    // persist updated tasks
    for (const ut of result.updatedTasks) {
      const raw = allTasksRaw.find((r) => r.id === ut.id);
      if (!raw) continue;
      const extras: any = {};
      if (ut.scheduledDate) {
        extras.scheduledDate = ut.scheduledDate;
        extras.originalScheduledDate = raw.originalScheduledDate ?? raw.scheduledDate;
      }
      if (ut.rescheduleCount && ut.rescheduleCount > raw.rescheduleCount) {
        extras.rescheduleCountIncrement = ut.rescheduleCount - raw.rescheduleCount;
      }
      if (Object.keys(extras).length > 0) {
        await taskRepo.updateStatus(raw.id, req.user!.id, 'RESCHEDULED', extras);
      }
    }

    return res.json({ result });
  }),
);

router.post(
  "/recompute",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const { goalId, reason } = req.body as { goalId?: string; reason?: string };

    if (!goalId) {
      return res.status(400).json({ error: 'Bad Request', message: 'goalId is required' });
    }

    const queues = await buildTopicQueuesFromDB(req.user!.id, goalId);
    const settings = await settingsRepo.findByUserId(req.user!.id);
    const availability = {
      activeDays: settings?.activeDays ?? ['monday','tuesday','wednesday','thursday','friday'],
      minutesPerDay: settings?.dailyMinutes ?? { monday: 60, tuesday: 60, wednesday: 60, thursday: 60, friday: 60, saturday: 0, sunday: 0 },
    } as any;

    const scheduled = scheduleMultiTopicTasks(queues, availability, new Date());
    const totalTaskCount = queues.reduce((count, queue) => count + queue.tasks.length, 0);
    const suggestedActions = scheduled.length < totalTaskCount
      ? [
          {
            type: 'increase-budget',
            label: 'Increase daily budget',
            details: 'Some tasks could not be placed with the current availability. Add more minutes per day to reduce pressure.',
          },
          {
            type: 'extend-deadline',
            label: 'Extend deadline',
            details: 'Move the goal deadline out so the planner has more active days to work with.',
          },
        ]
      : [];

    // persist results for matching tasks
    const allTasksRaw = await taskRepo.findByUserAndDateRange(req.user!.id, new Date(Date.now()-1000*60*60*24*365), new Date(Date.now()+1000*60*60*24*365));
    for (const su of scheduled) {
      const raw = allTasksRaw.find((r) => r.id === su.id);
      if (!raw) continue;
      await taskRepo.updateStatus(raw.id, req.user!.id, 'RESCHEDULED', {
        scheduledDate: su.scheduledDate,
        originalScheduledDate: raw.originalScheduledDate ?? raw.scheduledDate,
        rescheduledReason: reason ?? 'Recomputed schedule',
        rescheduleCountIncrement: 1,
      });
    }

    return res.json({
      result: {
        updated: scheduled.length,
        suggestedActions,
      },
    });
  }),
);

router.get(
  "/topics/status",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsRepo.findByUserId(req.user!.id);
    const activeDays = settings?.activeDays ?? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const dailyMinutes = settings?.dailyMinutes ?? {
      monday: 60,
      tuesday: 60,
      wednesday: 60,
      thursday: 60,
      friday: 60,
      saturday: 0,
      sunday: 0,
    };

    const tasks = await taskRepo.findByUserAndDateRange(
      req.user!.id,
      new Date(0),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    );

    const incompleteTasks = tasks.filter((task) => task.status !== 'COMPLETED');
    const topicMap = new Map<string, typeof incompleteTasks>();

    for (const task of incompleteTasks) {
      const topicId = task.skillId ?? task.goalId ?? task.playlistId ?? 'general';
      const current = topicMap.get(topicId) ?? [];
      current.push(task);
      topicMap.set(topicId, current);
    }

    const activeBudgetMinutes = activeDays.reduce((sum, day) => sum + (dailyMinutes[day as keyof typeof dailyMinutes] ?? 0), 0);
    const dailyBudget = activeDays.length > 0 ? activeBudgetMinutes / activeDays.length : 60;

    const topics = Array.from(topicMap.entries()).map(([topicId, topicTasks]) => {
      const remainingMinutes = topicTasks.reduce((sum, task) => sum + task.estimatedMinutes, 0);
      const latestDate = topicTasks.reduce(
        (latest, task) => (task.scheduledDate > latest ? task.scheduledDate : latest),
        topicTasks[0].scheduledDate,
      );

      let remainingDays = 1;
      const cursor = new Date();
      cursor.setHours(0, 0, 0, 0);

      while (cursor.getTime() <= latestDate.getTime()) {
        const weekday = cursor.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        if (activeDays.includes(weekday)) {
          remainingDays += 1;
        }
        cursor.setDate(cursor.getDate() + 1);
      }

      const burnRate = remainingMinutes / Math.max(1, remainingDays);
      const status = burnRate > dailyBudget * 1.5 ? 'behind' : burnRate > dailyBudget * 1.2 ? 'at_risk' : 'on_track';

      return {
        topicId,
        burnRate,
        remainingMinutes,
        remainingDays,
        status,
      };
    });

    return res.json({ topics });
  }),
);

router.get(
  "/buffer",
  requireUser,
  asyncHandler(async (req: Request, res: Response) => {
    const tasks = await taskRepo.findByUserAndDateRange(
      req.user!.id,
      new Date(0),
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    );

    const bufferSource = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      type: 'learn' as const,
      topicId: task.skillId ?? task.goalId ?? task.playlistId ?? undefined,
      scheduledDate: task.scheduledDate,
      estimatedMinutes: task.estimatedMinutes,
      actualMinutes: task.completedDurationMinutes ?? undefined,
    }));

    const buffers = buildBufferPoolsFromHistory(bufferSource).map((pool) => decayBufferPoolEntries(pool));

    return res.json({ buffers });
  }),
);

export default router;
