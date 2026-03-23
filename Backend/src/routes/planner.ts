/**
 * Planner Routes
 */

import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware";
import { plannerService, userService } from "../services";
import { rescheduleMissedTasks } from "../services/reschedule.service";
import config from "../config";

const router = Router();

function buildDevPlannerSnapshot() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    scheduleDays: [],
    missedTasks: [],
    workloadIntensity: "normal" as const,
    workloadStats: {
      tasksPerDay: { light: 1, normal: 2, aggressive: 3 },
      revisionDensity: { light: "20%", normal: "30%", aggressive: "40%" },
      bufferUsage: { light: "15%", normal: "10%", aggressive: "5%" },
    },
    currentLoad: {
      daily: 0,
      weekly: 0,
      maxRecommended: 420,
    },
    burnoutSignals: {
      riskLevel: "low" as const,
      indicators: [],
      recommendations: [],
      detectedPatterns: [],
    },
    pendingChanges: [],
    lastReschedule: today,
  };
}

router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const user = await userService.getUserByClerkId(clerkId);

    if (!user) {
      if (config.isDevelopment) {
        return res.json({ planner: buildDevPlannerSnapshot() });
      }
      return res
        .status(404)
        .json({ error: "Not Found", message: "User not found" });
    }

    const planner = await plannerService.getPlannerSnapshot(user.id);
    return res.json({ planner });
  } catch (error) {
    console.error("Planner fetch error:", error);
    return res
      .status(500)
      .json({ error: "Fetch Failed", message: "Failed to fetch planner data" });
  }
});

router.post("/generate", requireAuth, async (req: Request, res: Response) => {
  try {
    const clerkId = req.auth!.userId;
    const { playlistIds, startDate } = req.body as {
      playlistIds?: string[];
      startDate?: string;
    };

    if (!playlistIds || playlistIds.length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message:
          "playlistIds is required and must contain at least one playlist ID",
      });
    }

    const user = await userService.getUserByClerkId(clerkId);
    if (!user) {
      return res
        .status(404)
        .json({ error: "Not Found", message: "User not found" });
    }

    const result = await plannerService.generateScheduleFromPlaylists(user.id, {
      playlistIds,
      startDate,
    });

    return res.status(201).json({ result });
  } catch (error) {
    console.error("Planner generate error:", error);
    return res
      .status(500)
      .json({ error: "Create Failed", message: "Failed to generate schedule" });
  }
});

router.post(
  "/resolve/:taskId",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const clerkId = req.auth!.userId;
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

      const user = await userService.getUserByClerkId(clerkId);
      if (!user) {
        return res
          .status(404)
          .json({ error: "Not Found", message: "User not found" });
      }

      const result = await plannerService.resolveMissedTask(
        user.id,
        taskId,
        type,
      );
      if (!result) {
        return res
          .status(404)
          .json({ error: "Not Found", message: "Task not found" });
      }

      return res.json({ result });
    } catch (error) {
      console.error("Resolve missed task error:", error);
      return res.status(500).json({
        error: "Update Failed",
        message: "Failed to resolve missed task",
      });
    }
  },
);

router.post("/test/reschedule", requireAuth, async (req, res) => {
  try {
    const clerkId = req.auth!.userId;
    const user = await userService.getUserByClerkId(clerkId);

    if (!user) return res.status(404).json({ error: "User not found" });

    const result = await rescheduleMissedTasks(user.id);

    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Test failed" });
  }
});

export default router;
