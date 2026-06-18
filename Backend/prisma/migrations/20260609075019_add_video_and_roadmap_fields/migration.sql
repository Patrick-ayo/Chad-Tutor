-- AlterTable
ALTER TABLE "LectureSummary" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "StudyTask" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "roadmapId" TEXT,
ADD COLUMN     "sequenceNumber" INTEGER,
ADD COLUMN     "subtopicId" TEXT,
ADD COLUMN     "topicId" TEXT,
ADD COLUMN     "videoId" TEXT,
ADD COLUMN     "videoTitle" TEXT,
ADD COLUMN     "videoUrl" TEXT;

-- CreateTable
CREATE TABLE "UserGoals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "selectedSkills" TEXT[],
    "selectedRoles" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserGoals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserGoals_userId_key" ON "UserGoals"("userId");

-- CreateIndex
CREATE INDEX "UserGoals_userId_idx" ON "UserGoals"("userId");
