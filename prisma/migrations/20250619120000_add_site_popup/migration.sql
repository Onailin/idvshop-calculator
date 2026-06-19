-- CreateTable
CREATE TABLE "SitePopup" (
    "id" TEXT NOT NULL,
    "headline" TEXT,
    "body" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "confirmLabel" TEXT NOT NULL DEFAULT 'ตกลง',
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SitePopup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SitePopup_isActive_sortOrder_idx" ON "SitePopup"("isActive", "sortOrder");
