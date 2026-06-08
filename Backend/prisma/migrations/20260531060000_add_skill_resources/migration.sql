-- Add missing Skill.resources column for Explore roadmap detail queries
ALTER TABLE "Skill"
ADD COLUMN IF NOT EXISTS "resources" JSONB;
