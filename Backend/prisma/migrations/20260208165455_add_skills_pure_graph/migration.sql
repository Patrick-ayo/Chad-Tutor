-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "SkillEdgeType" AS ENUM ('SUBSKILL_OF', 'PREREQUISITE', 'RELATED', 'ALTERNATIVE', 'BUILDS_ON', 'COMPLEMENTS');

-- CreateEnum
CREATE TYPE "SkillStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'MASTERED');

-- CreateEnum
CREATE TYPE "MasteryLevel" AS ENUM ('NONE', 'FAMILIAR', 'COMPETENT', 'PROFICIENT', 'EXPERT', 'MASTERED');

-- CreateEnum
CREATE TYPE "SelectionSource" AS ENUM ('USER_SELECTED', 'AI_RECOMMENDED', 'ROLE_REQUIRED', 'GOAL_DERIVED', 'PREREQUISITE');

-- CreateTable
CREATE TABLE "SkillCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "sortOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "SkillTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "normalizedName" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "color" VARCHAR(20),
    "categoryId" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "isCanonical" BOOLEAN NOT NULL DEFAULT true,
    "canonicalId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillEdge" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "edgeType" "SkillEdgeType" NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isStrict" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SkillEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSkillProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "status" "SkillStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "masteryLevel" "MasteryLevel" NOT NULL DEFAULT 'NONE',
    "accuracyRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStreak" SMALLINT NOT NULL DEFAULT 0,
    "longestStreak" SMALLINT NOT NULL DEFAULT 0,
    "lastPracticed" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSkillProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSelectedSkill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "sourceType" "SelectionSource" NOT NULL DEFAULT 'USER_SELECTED',
    "includeSubskills" BOOLEAN NOT NULL DEFAULT true,
    "priority" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSelectedSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SkillToSkillTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_name_key" ON "SkillCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillCategory_slug_key" ON "SkillCategory"("slug");

-- CreateIndex
CREATE INDEX "SkillCategory_slug_idx" ON "SkillCategory"("slug");

-- CreateIndex
CREATE INDEX "SkillCategory_sortOrder_idx" ON "SkillCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "SkillTag_name_key" ON "SkillTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SkillTag_slug_key" ON "SkillTag"("slug");

-- CreateIndex
CREATE INDEX "SkillTag_slug_idx" ON "SkillTag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_slug_key" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_categoryId_idx" ON "Skill"("categoryId");

-- CreateIndex
CREATE INDEX "Skill_slug_idx" ON "Skill"("slug");

-- CreateIndex
CREATE INDEX "Skill_normalizedName_isCanonical_idx" ON "Skill"("normalizedName", "isCanonical");

-- CreateIndex
CREATE INDEX "Skill_canonicalId_idx" ON "Skill"("canonicalId");

-- CreateIndex
CREATE INDEX "Skill_difficulty_idx" ON "Skill"("difficulty");

-- CreateIndex
CREATE INDEX "Skill_isPublished_idx" ON "Skill"("isPublished");

-- CreateIndex
CREATE INDEX "SkillEdge_sourceId_edgeType_idx" ON "SkillEdge"("sourceId", "edgeType");

-- CreateIndex
CREATE INDEX "SkillEdge_targetId_edgeType_idx" ON "SkillEdge"("targetId", "edgeType");

-- CreateIndex
CREATE INDEX "SkillEdge_edgeType_idx" ON "SkillEdge"("edgeType");

-- CreateIndex
CREATE UNIQUE INDEX "SkillEdge_sourceId_targetId_edgeType_key" ON "SkillEdge"("sourceId", "targetId", "edgeType");

-- CreateIndex
CREATE INDEX "UserSkillProgress_userId_idx" ON "UserSkillProgress"("userId");

-- CreateIndex
CREATE INDEX "UserSkillProgress_skillId_idx" ON "UserSkillProgress"("skillId");

-- CreateIndex
CREATE INDEX "UserSkillProgress_status_idx" ON "UserSkillProgress"("status");

-- CreateIndex
CREATE INDEX "UserSkillProgress_lastPracticed_idx" ON "UserSkillProgress"("lastPracticed");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillProgress_userId_skillId_key" ON "UserSkillProgress"("userId", "skillId");

-- CreateIndex
CREATE INDEX "UserSelectedSkill_userId_idx" ON "UserSelectedSkill"("userId");

-- CreateIndex
CREATE INDEX "UserSelectedSkill_sourceType_idx" ON "UserSelectedSkill"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "UserSelectedSkill_userId_skillId_key" ON "UserSelectedSkill"("userId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "_SkillToSkillTag_AB_unique" ON "_SkillToSkillTag"("A", "B");

-- CreateIndex
CREATE INDEX "_SkillToSkillTag_B_index" ON "_SkillToSkillTag"("B");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SkillCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_canonicalId_fkey" FOREIGN KEY ("canonicalId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEdge" ADD CONSTRAINT "SkillEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillEdge" ADD CONSTRAINT "SkillEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillProgress" ADD CONSTRAINT "UserSkillProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSkillProgress" ADD CONSTRAINT "UserSkillProgress_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSelectedSkill" ADD CONSTRAINT "UserSelectedSkill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSelectedSkill" ADD CONSTRAINT "UserSelectedSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SkillToSkillTag" ADD CONSTRAINT "_SkillToSkillTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SkillToSkillTag" ADD CONSTRAINT "_SkillToSkillTag_B_fkey" FOREIGN KEY ("B") REFERENCES "SkillTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
