-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'MISSED', 'RESCHEDULED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateTable
CREATE TABLE "LearningPlaylist" (
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"name" VARCHAR(255) NOT NULL,
	"description" TEXT,
	"externalSource" VARCHAR(50) NOT NULL,
	"externalId" VARCHAR(255),
	"externalUrl" VARCHAR(500),
	"estimatedHours" DOUBLE PRECISION,
	"resourceCount" INTEGER NOT NULL DEFAULT 0,
	"thumbnailUrl" VARCHAR(500),
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "LearningPlaylist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlaylistItem" (
	"id" TEXT NOT NULL,
	"playlistId" TEXT NOT NULL,
	"title" VARCHAR(255) NOT NULL,
	"description" TEXT,
	"externalId" VARCHAR(255),
	"externalUrl" VARCHAR(500),
	"sequence" INTEGER NOT NULL DEFAULT 0,
	"estimatedMinutes" INTEGER,
	"keyPoints" JSONB,
	"learningOutcomes" JSONB,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "PlaylistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillPlaylistLink" (
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"skillId" TEXT NOT NULL,
	"playlistId" TEXT NOT NULL,
	"resourceType" VARCHAR(50) NOT NULL DEFAULT 'primary',
	"sequence" INTEGER NOT NULL DEFAULT 0,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "SkillPlaylistLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyTask" (
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"skillId" TEXT,
	"goalId" TEXT,
	"playlistId" TEXT,
	"playlistItemId" TEXT,
	"title" VARCHAR(255) NOT NULL,
	"description" TEXT,
	"scheduledDate" TIMESTAMP(3) NOT NULL,
	"scheduledTime" VARCHAR(10),
	"estimatedMinutes" INTEGER NOT NULL DEFAULT 25,
	"priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
	"status" "TaskStatus" NOT NULL DEFAULT 'SCHEDULED',
	"keyPoints" JSONB,
	"learningOutcomes" JSONB,
	"attemptCount" INTEGER NOT NULL DEFAULT 0,
	"rescheduleCount" INTEGER NOT NULL DEFAULT 0,
	"originalScheduledDate" TIMESTAMP(3),
	"rescheduledReason" VARCHAR(255),
	"completedAt" TIMESTAMP(3),
	"completedDurationMinutes" INTEGER,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"updatedAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "StudyTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"skillId" TEXT,
	"taskId" TEXT,
	"questionsCount" INTEGER NOT NULL DEFAULT 0,
	"correctCount" INTEGER NOT NULL DEFAULT 0,
	"score" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"timeSpentSeconds" INTEGER,
	"metadata" JSONB,
	"completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

	CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestResultCache" (
	"id" TEXT NOT NULL,
	"userId" TEXT NOT NULL,
	"skillId" TEXT,
	"latestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"latestAttemptAt" TIMESTAMP(3),
	"totalAttempts" INTEGER NOT NULL DEFAULT 0,
	"averageScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"bestScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
	"lastCachedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"expiresAt" TIMESTAMP(3) NOT NULL,

	CONSTRAINT "TestResultCache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LearningPlaylist_userId_createdAt_idx" ON "LearningPlaylist"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "LearningPlaylist_externalSource_externalId_idx" ON "LearningPlaylist"("externalSource", "externalId");

-- CreateIndex
CREATE INDEX "PlaylistItem_playlistId_sequence_idx" ON "PlaylistItem"("playlistId", "sequence");

-- CreateIndex
CREATE UNIQUE INDEX "SkillPlaylistLink_userId_skillId_playlistId_resourceType_key" ON "SkillPlaylistLink"("userId", "skillId", "playlistId", "resourceType");

-- CreateIndex
CREATE INDEX "SkillPlaylistLink_userId_skillId_idx" ON "SkillPlaylistLink"("userId", "skillId");

-- CreateIndex
CREATE INDEX "SkillPlaylistLink_playlistId_idx" ON "SkillPlaylistLink"("playlistId");

-- CreateIndex
CREATE INDEX "StudyTask_userId_scheduledDate_status_idx" ON "StudyTask"("userId", "scheduledDate", "status");

-- CreateIndex
CREATE INDEX "StudyTask_userId_status_idx" ON "StudyTask"("userId", "status");

-- CreateIndex
CREATE INDEX "StudyTask_priority_status_idx" ON "StudyTask"("priority", "status");

-- CreateIndex
CREATE INDEX "StudyTask_skillId_idx" ON "StudyTask"("skillId");

-- CreateIndex
CREATE INDEX "StudyTask_goalId_idx" ON "StudyTask"("goalId");

-- CreateIndex
CREATE INDEX "StudyTask_playlistId_idx" ON "StudyTask"("playlistId");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_completedAt_idx" ON "QuizAttempt"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "QuizAttempt_userId_skillId_idx" ON "QuizAttempt"("userId", "skillId");

-- CreateIndex
CREATE INDEX "QuizAttempt_taskId_idx" ON "QuizAttempt"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "TestResultCache_userId_skillId_key" ON "TestResultCache"("userId", "skillId");

-- CreateIndex
CREATE INDEX "TestResultCache_userId_expiresAt_idx" ON "TestResultCache"("userId", "expiresAt");

-- AddForeignKey
ALTER TABLE "LearningPlaylist" ADD CONSTRAINT "LearningPlaylist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlaylistItem" ADD CONSTRAINT "PlaylistItem_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "LearningPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillPlaylistLink" ADD CONSTRAINT "SkillPlaylistLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillPlaylistLink" ADD CONSTRAINT "SkillPlaylistLink_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillPlaylistLink" ADD CONSTRAINT "SkillPlaylistLink_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "LearningPlaylist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "Goal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "LearningPlaylist"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyTask" ADD CONSTRAINT "StudyTask_playlistItemId_fkey" FOREIGN KEY ("playlistItemId") REFERENCES "PlaylistItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "StudyTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResultCache" ADD CONSTRAINT "TestResultCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestResultCache" ADD CONSTRAINT "TestResultCache_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
