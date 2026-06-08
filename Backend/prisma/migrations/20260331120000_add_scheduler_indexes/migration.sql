-- Add scheduler-focused indexes for StudyTask planning/rescheduling queries.
CREATE INDEX IF NOT EXISTS "StudyTask_userId_status_scheduledDate_idx"
ON "StudyTask"("userId", "status", "scheduledDate");

CREATE INDEX IF NOT EXISTS "StudyTask_userId_priority_scheduledDate_idx"
ON "StudyTask"("userId", "priority", "scheduledDate");

CREATE INDEX IF NOT EXISTS "StudyTask_playlistId_scheduledDate_idx"
ON "StudyTask"("playlistId", "scheduledDate");
