-- Migrate D -> C
UPDATE "Item"
SET "rarity" = 'C'
WHERE "rarity"::text = 'D';

ALTER TABLE "Item" ALTER COLUMN "rarity" DROP DEFAULT;

ALTER TYPE "Rarity" RENAME TO "Rarity_old";

CREATE TYPE "Rarity" AS ENUM ('NONE', 'S+', 'S', 'A', 'B', 'C');

ALTER TABLE "Item"
ALTER COLUMN "rarity" TYPE "Rarity"
USING ("rarity"::text::"Rarity");

DROP TYPE "Rarity_old";

ALTER TABLE "Item" ALTER COLUMN "rarity" SET DEFAULT 'NONE';
