-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "roadmapId" TEXT;

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" VARCHAR(50),
    "color" VARCHAR(20),
    "rootSkillId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" SMALLINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_name_key" ON "Roadmap"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_slug_key" ON "Roadmap"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Roadmap_rootSkillId_key" ON "Roadmap"("rootSkillId");

-- CreateIndex
CREATE INDEX "Roadmap_slug_idx" ON "Roadmap"("slug");

-- CreateIndex
CREATE INDEX "Roadmap_isPublished_idx" ON "Roadmap"("isPublished");

-- CreateIndex
CREATE INDEX "Roadmap_sortOrder_idx" ON "Roadmap"("sortOrder");

-- CreateIndex
CREATE INDEX "Skill_roadmapId_idx" ON "Skill"("roadmapId");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_rootSkillId_fkey" FOREIGN KEY ("rootSkillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;
