import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = process.argv[2];
  const newPassword = process.argv[3];

  if (!username || !newPassword) {
    console.error("Usage: npm run db:change-password -- <username> <new-password>");
    console.error("Example: npm run db:change-password -- admin MyNewSecurePass123");
    process.exit(1);
  }

  if (newPassword.length < 6) {
    console.error("Error: Password must be at least 6 characters.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    console.error(`Error: User "${username}" not found.`);
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { username },
    data: { passwordHash },
  });

  console.log(`Password updated for user "${username}".`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
