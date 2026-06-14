import { createPrismaClient } from "../src/lib/create-prisma-client";

const prisma = createPrismaClient();

async function main() {
  const count = await prisma.user.count();
  console.log("DB OK, users:", count);
}

main()
  .catch((error) => {
    console.error("DB FAIL:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
