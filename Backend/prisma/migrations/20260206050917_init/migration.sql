-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('LEARNER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "EnforcementLevel" AS ENUM ('LIGHT', 'NORMAL', 'AGGRESSIVE');

-- CreateEnum
CREATE TYPE "RescheduleMode" AS ENUM ('AUTO', 'MANUAL', 'ASK');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('UNIVERSITY', 'COURSE', 'SEMESTER', 'SUBJECT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "roles" "UserRole"[] DEFAULT ARRAY['LEARNER']::"UserRole"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeDays" TEXT[] DEFAULT ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday']::TEXT[],
    "dailyMinutes" JSONB NOT NULL DEFAULT '{"monday":60,"tuesday":60,"wednesday":60,"thursday":60,"friday":60}',
    "sessionDuration" INTEGER NOT NULL DEFAULT 25,
    "breakFrequency" INTEGER NOT NULL DEFAULT 3,
    "enforcementLevel" "EnforcementLevel" NOT NULL DEFAULT 'NORMAL',
    "rescheduleMode" "RescheduleMode" NOT NULL DEFAULT 'AUTO',
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "pushNotifications" BOOLEAN NOT NULL DEFAULT true,
    "dailyReminder" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "missedTaskAlert" BOOLEAN NOT NULL DEFAULT true,
    "aiExplanations" BOOLEAN NOT NULL DEFAULT true,
    "aiQuizGeneration" BOOLEAN NOT NULL DEFAULT true,
    "aiProgressInsights" BOOLEAN NOT NULL DEFAULT true,
    "lastDataExport" TIMESTAMP(3),
    "dataRetentionDays" INTEGER NOT NULL DEFAULT 90,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enforcement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "violationCount" INTEGER NOT NULL DEFAULT 0,
    "lastViolation" TIMESTAMP(3),
    "violationHistory" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "isOnProbation" BOOLEAN NOT NULL DEFAULT false,
    "probationCount" INTEGER NOT NULL DEFAULT 0,
    "probationStart" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enforcement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "deadline" TIMESTAMP(3) NOT NULL,
    "totalHours" INTEGER NOT NULL DEFAULT 0,
    "completedHours" INTEGER NOT NULL DEFAULT 0,
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "milestones" JSONB[] DEFAULT ARRAY[]::JSONB[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SettingsChangeLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "changes" JSONB[],
    "impactScore" SMALLINT NOT NULL,
    "warningLevel" SMALLINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SettingsChangeLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExternalSource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "apiEndpoint" TEXT,
    "rateLimit" SMALLINT NOT NULL DEFAULT 100,
    "lastSync" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "normalizedName" VARCHAR(255) NOT NULL,
    "country" VARCHAR(100),
    "type" VARCHAR(100),
    "isCanonical" BOOLEAN NOT NULL DEFAULT true,
    "canonicalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "normalizedName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "duration" VARCHAR(50),
    "totalSemesters" SMALLINT NOT NULL DEFAULT 8,
    "isCanonical" BOOLEAN NOT NULL DEFAULT true,
    "canonicalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Semester" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "number" SMALLINT NOT NULL,
    "position" SMALLINT NOT NULL DEFAULT 0,
    "isCanonical" BOOLEAN NOT NULL DEFAULT true,
    "canonicalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "semesterId" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "normalizedName" VARCHAR(255) NOT NULL,
    "code" VARCHAR(20),
    "credits" SMALLINT NOT NULL DEFAULT 0,
    "marks" SMALLINT NOT NULL DEFAULT 100,
    "metadata" JSONB,
    "isCanonical" BOOLEAN NOT NULL DEFAULT true,
    "canonicalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchCache" (
    "id" TEXT NOT NULL,
    "normalizedQuery" VARCHAR(500) NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "resultIds" TEXT[],
    "resultCount" SMALLINT NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "rawQuery" VARCHAR(500) NOT NULL,
    "normalizedQuery" VARCHAR(500) NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "resultCount" SMALLINT NOT NULL DEFAULT 0,
    "latencyMs" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRefresh" (
    "id" TEXT NOT NULL,
    "entityType" "EntityType" NOT NULL,
    "entityId" TEXT NOT NULL,
    "refreshedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "previousHash" VARCHAR(64),
    "newHash" VARCHAR(64),
    "hasChanges" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContentRefresh_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "viewCount" SMALLINT NOT NULL DEFAULT 1,
    "totalViewMs" INTEGER NOT NULL DEFAULT 0,
    "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkId_key" ON "User"("clerkId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_clerkId_idx" ON "User"("clerkId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enforcement_userId_key" ON "Enforcement"("userId");

-- CreateIndex
CREATE INDEX "Enforcement_userId_idx" ON "Enforcement"("userId");

-- CreateIndex
CREATE INDEX "Enforcement_isOnProbation_idx" ON "Enforcement"("isOnProbation");

-- CreateIndex
CREATE INDEX "Goal_userId_status_idx" ON "Goal"("userId", "status");

-- CreateIndex
CREATE INDEX "Goal_deadline_idx" ON "Goal"("deadline");

-- CreateIndex
CREATE INDEX "Goal_status_idx" ON "Goal"("status");

-- CreateIndex
CREATE INDEX "SettingsChangeLog_userId_createdAt_idx" ON "SettingsChangeLog"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExternalSource_name_key" ON "ExternalSource"("name");

-- CreateIndex
CREATE INDEX "ExternalSource_isActive_idx" ON "ExternalSource"("isActive");

-- CreateIndex
CREATE INDEX "ExternalSource_lastSync_idx" ON "ExternalSource"("lastSync");

-- CreateIndex
CREATE INDEX "University_normalizedName_isCanonical_idx" ON "University"("normalizedName", "isCanonical");

-- CreateIndex
CREATE INDEX "University_isCanonical_idx" ON "University"("isCanonical");

-- CreateIndex
CREATE INDEX "University_sourceId_idx" ON "University"("sourceId");

-- CreateIndex
CREATE INDEX "University_canonicalId_idx" ON "University"("canonicalId");

-- CreateIndex
CREATE UNIQUE INDEX "University_sourceId_externalId_key" ON "University"("sourceId", "externalId");

-- CreateIndex
CREATE INDEX "Course_normalizedName_isCanonical_idx" ON "Course"("normalizedName", "isCanonical");

-- CreateIndex
CREATE INDEX "Course_universityId_idx" ON "Course"("universityId");

-- CreateIndex
CREATE INDEX "Course_sourceId_idx" ON "Course"("sourceId");

-- CreateIndex
CREATE INDEX "Course_canonicalId_idx" ON "Course"("canonicalId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_sourceId_externalId_key" ON "Course"("sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Course_universityId_sourceId_externalId_key" ON "Course"("universityId", "sourceId", "externalId");

-- CreateIndex
CREATE INDEX "Semester_courseId_idx" ON "Semester"("courseId");

-- CreateIndex
CREATE INDEX "Semester_sourceId_idx" ON "Semester"("sourceId");

-- CreateIndex
CREATE INDEX "Semester_number_idx" ON "Semester"("number");

-- CreateIndex
CREATE INDEX "Semester_canonicalId_idx" ON "Semester"("canonicalId");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_courseId_sourceId_externalId_key" ON "Semester"("courseId", "sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Semester_courseId_number_key" ON "Semester"("courseId", "number");

-- CreateIndex
CREATE INDEX "Subject_normalizedName_isCanonical_idx" ON "Subject"("normalizedName", "isCanonical");

-- CreateIndex
CREATE INDEX "Subject_semesterId_idx" ON "Subject"("semesterId");

-- CreateIndex
CREATE INDEX "Subject_sourceId_idx" ON "Subject"("sourceId");

-- CreateIndex
CREATE INDEX "Subject_code_idx" ON "Subject"("code");

-- CreateIndex
CREATE INDEX "Subject_canonicalId_idx" ON "Subject"("canonicalId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_semesterId_sourceId_externalId_key" ON "Subject"("semesterId", "sourceId", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_semesterId_code_key" ON "Subject"("semesterId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "SearchCache_normalizedQuery_key" ON "SearchCache"("normalizedQuery");

-- CreateIndex
CREATE INDEX "SearchCache_entityType_normalizedQuery_idx" ON "SearchCache"("entityType", "normalizedQuery");

-- CreateIndex
CREATE INDEX "SearchCache_expiresAt_idx" ON "SearchCache"("expiresAt");

-- CreateIndex
CREATE INDEX "SearchCache_hitCount_idx" ON "SearchCache"("hitCount");

-- CreateIndex
CREATE INDEX "SearchLog_userId_createdAt_idx" ON "SearchLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchLog_entityType_createdAt_idx" ON "SearchLog"("entityType", "createdAt");

-- CreateIndex
CREATE INDEX "SearchLog_cacheHit_idx" ON "SearchLog"("cacheHit");

-- CreateIndex
CREATE INDEX "SearchLog_latencyMs_idx" ON "SearchLog"("latencyMs");

-- CreateIndex
CREATE INDEX "ContentRefresh_entityType_refreshedAt_idx" ON "ContentRefresh"("entityType", "refreshedAt");

-- CreateIndex
CREATE INDEX "ContentRefresh_success_idx" ON "ContentRefresh"("success");

-- CreateIndex
CREATE INDEX "ContentRefresh_hasChanges_idx" ON "ContentRefresh"("hasChanges");

-- CreateIndex
CREATE UNIQUE INDEX "ContentRefresh_entityType_entityId_key" ON "ContentRefresh"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ContentUsage_userId_lastViewedAt_idx" ON "ContentUsage"("userId", "lastViewedAt");

-- CreateIndex
CREATE INDEX "ContentUsage_subjectId_idx" ON "ContentUsage"("subjectId");

-- CreateIndex
CREATE INDEX "ContentUsage_lastViewedAt_idx" ON "ContentUsage"("lastViewedAt");

-- CreateIndex
CREATE INDEX "ContentUsage_sessionId_idx" ON "ContentUsage"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentUsage_userId_subjectId_key" ON "ContentUsage"("userId", "subjectId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enforcement" ADD CONSTRAINT "Enforcement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SettingsChangeLog" ADD CONSTRAINT "SettingsChangeLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExternalSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "University" ADD CONSTRAINT "University_canonicalId_fkey" FOREIGN KEY ("canonicalId") REFERENCES "University"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExternalSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_canonicalId_fkey" FOREIGN KEY ("canonicalId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExternalSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Semester" ADD CONSTRAINT "Semester_canonicalId_fkey" FOREIGN KEY ("canonicalId") REFERENCES "Semester"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ExternalSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_semesterId_fkey" FOREIGN KEY ("semesterId") REFERENCES "Semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_canonicalId_fkey" FOREIGN KEY ("canonicalId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchLog" ADD CONSTRAINT "SearchLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentUsage" ADD CONSTRAINT "ContentUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentUsage" ADD CONSTRAINT "ContentUsage_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
