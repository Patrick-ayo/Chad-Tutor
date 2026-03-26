/**
 * Planner Routes
 */

import { Router, Request, Response } from "express";
import { asyncHandler, requireUser } from "../middleware";
import { plannerService } from "../services";
import { rescheduleMissedTasks } from "../services/reschedule.service";

const router = Router();

router.get("/", requireUser, asyncHandler(async (req: Request, res: Response) => {
  const planner = await plannerService.getPlannerSnapshot(req.user!.id);
  return res.json({ planner });
}));

router.post("/generate", requireUser, asyncHandler(async (req: Request, res: Response) => {
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

  const result = await plannerService.generateScheduleFromPlaylists(req.user!.id, {
    playlistIds,
    startDate,
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

router.post("/test/reschedule", requireUser, asyncHandler(async (req, res) => {
  const result = await rescheduleMissedTasks(req.user!.id);
  res.json({ result });
}));

export default router;
