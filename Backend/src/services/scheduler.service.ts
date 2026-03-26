import { taskRepo } from "../repositories";
import type { StudyTask } from "@prisma/client";
import { assertRowsAffected } from "./serviceErrors";

async function findNextSlotForTask(
  userId: string,
  fromDate: Date,
  estimatedMinutes: number,
): Promise<Date | null> {
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(fromDate);
    candidate.setDate(candidate.getDate() + i);

    const scheduled = await taskRepo.getDailyScheduledMinutes(
      userId,
      candidate,
    );

    if (scheduled + estimatedMinutes <= 120) {
      return candidate;
    }
  }

  return null;
}

export async function reassignSlots(userId: string, tasks: StudyTask[]) {
  let cursor = new Date();

  for (const task of tasks) {
    const nextSlot = await findNextSlotForTask(
      userId,
      cursor,
      task.estimatedMinutes,
    );

    if (nextSlot) {
      const updatedCount = await taskRepo.updateStatus(task.id, userId, "RESCHEDULED", {
        scheduledDate: nextSlot,
        rescheduledReason: "Reassigned in scheduler",
        rescheduleCountIncrement: 1,
      });
      assertRowsAffected(updatedCount, "Task not found");

      cursor = nextSlot;
    }
  }
}
