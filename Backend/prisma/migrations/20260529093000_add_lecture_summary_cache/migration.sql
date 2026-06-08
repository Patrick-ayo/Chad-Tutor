-- Create lecture summary cache table for lazy-generated lecture content.
CREATE TABLE IF NOT EXISTS "LectureSummary" (
  "id" TEXT NOT NULL,
  "videoId" TEXT NOT NULL,
  "taskId" TEXT,
  "transcriptSummary" TEXT,
  "topicOverview" TEXT,
  "expertInsight" TEXT,
  "quizQuestions" JSONB,
  "rawTranscript" TEXT,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "LectureSummary_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LectureSummary_videoId_key" ON "LectureSummary"("videoId");
