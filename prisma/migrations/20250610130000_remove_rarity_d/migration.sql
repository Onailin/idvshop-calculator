-- Migrate existing D rarity items to C before removing the enum value
UPDATE "Item"
SET "rarity" = 'C'
WHERE "rarity" = 'D';

-- Recreate Rarity enum without D
ALTER TYPE "Rarity" RENAME TO "Rarity_old";

CREATE TYPE "Rarity" AS ENUM ('S+', 'S', 'A', 'B', 'C');

ALTER TABLE "Item"
ALTER COLUMN "rarity" TYPE "Rarity"
USING ("rarity"::text::"Rarity");

DROP TYPE "Rarity_old";
