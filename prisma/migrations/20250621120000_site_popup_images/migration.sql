-- CreateTable
CREATE TABLE "SitePopupImage" (
    "id" TEXT NOT NULL,
    "popupId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePopupImage_pkey" PRIMARY KEY ("id")
);

-- Migrate existing single-image popups
INSERT INTO "SitePopupImage" ("id", "popupId", "imageUrl", "imageAlt", "linkUrl", "sortOrder", "createdAt", "updatedAt")
SELECT
    'migrated_' || "id",
    "id",
    "imageUrl",
    "imageAlt",
    "linkUrl",
    COALESCE("sortOrder", 0),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "SitePopup"
WHERE "imageUrl" IS NOT NULL AND "imageUrl" <> '';

-- DropIndex
DROP INDEX IF EXISTS "SitePopup_isActive_sortOrder_idx";

-- AlterTable
ALTER TABLE "SitePopup" DROP COLUMN "imageUrl",
DROP COLUMN "imageAlt",
DROP COLUMN "confirmLabel",
DROP COLUMN "linkUrl",
DROP COLUMN "sortOrder";

-- CreateIndex
CREATE INDEX "SitePopup_isActive_idx" ON "SitePopup"("isActive");

-- CreateIndex
CREATE INDEX "SitePopupImage_popupId_sortOrder_idx" ON "SitePopupImage"("popupId", "sortOrder");

-- AddForeignKey
ALTER TABLE "SitePopupImage" ADD CONSTRAINT "SitePopupImage_popupId_fkey" FOREIGN KEY ("popupId") REFERENCES "SitePopup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
