-- AlterTable
ALTER TABLE "SitePopup" ADD COLUMN IF NOT EXISTS "headlineIcon" TEXT DEFAULT 'sparkles';
ALTER TABLE "SitePopup" ADD COLUMN IF NOT EXISTS "headlineStyle" TEXT DEFAULT 'rose';
