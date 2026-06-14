-- CreateTable
CREATE TABLE "PackageGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageGroup_pkey" PRIMARY KEY ("id")
);

-- DropTable
DROP TABLE IF EXISTS "Package";

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "buttons" INTEGER NOT NULL,
    "topupAmount" INTEGER,
    "price" INTEGER NOT NULL,
    "packageGroupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PackageGroup_name_key" ON "PackageGroup"("name");

-- CreateIndex
CREATE INDEX "Package_packageGroupId_idx" ON "Package"("packageGroupId");

-- CreateIndex
CREATE INDEX "Package_buttons_idx" ON "Package"("buttons");

-- CreateIndex
CREATE INDEX "Package_price_idx" ON "Package"("price");

-- AddForeignKey
ALTER TABLE "Package" ADD CONSTRAINT "Package_packageGroupId_fkey" FOREIGN KEY ("packageGroupId") REFERENCES "PackageGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
