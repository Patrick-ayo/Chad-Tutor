-- AlterTable
ALTER TABLE "University" ADD COLUMN     "alphaCode" VARCHAR(10),
ADD COLUMN     "domain" VARCHAR(255),
ADD COLUMN     "provider" VARCHAR(50) NOT NULL DEFAULT 'unknown',
ADD COLUMN     "state" VARCHAR(100),
ADD COLUMN     "webPage" VARCHAR(500);

-- CreateIndex
CREATE INDEX "University_country_isCanonical_idx" ON "University"("country", "isCanonical");

-- CreateIndex
CREATE INDEX "University_provider_idx" ON "University"("provider");
