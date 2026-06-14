import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/create-prisma-client";

const prisma = createPrismaClient();

const HEAD_ADMIN_USERNAME = "fang1100";
const DEFAULT_SEED_PASSWORD = "harmonyheadadmin";

function resolveSeedPassword(): string {
  const configured = process.env.SEED_ADMIN_PASSWORD?.trim();

  if (configured) {
    if (configured.length < 8) {
      throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
    }
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SEED_ADMIN_PASSWORD is required when seeding in production",
    );
  }

  console.warn(
    "SEED_ADMIN_PASSWORD is not set. Using development-only default password.",
  );
  return DEFAULT_SEED_PASSWORD;
}

async function main() {
  const seedPassword = resolveSeedPassword();
  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const forcePasswordReset = process.env.SEED_FORCE_PASSWORD === "true";

  await prisma.user.deleteMany({
    where: { username: "admin" },
  });

  await prisma.user.upsert({
    where: { username: HEAD_ADMIN_USERNAME },
    update: forcePasswordReset
      ? { role: "SUPER_ADMIN", passwordHash }
      : { role: "SUPER_ADMIN" },
    create: {
      username: HEAD_ADMIN_USERNAME,
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { username: "admin2" },
    update: forcePasswordReset
      ? { role: "ADMIN", passwordHash }
      : { role: "ADMIN" },
    create: {
      username: "admin2",
      passwordHash,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { username: "admin3" },
    update: forcePasswordReset
      ? { role: "ADMIN", passwordHash }
      : { role: "ADMIN" },
    create: {
      username: "admin3",
      passwordHash,
      role: "ADMIN",
    },
  });

  const packageGroups = [
    { name: "Regular", isActive: true },
    { name: "Discount 3%", isActive: true },
    { name: "Discount 10%", isActive: true },
    { name: "Pre-order", isActive: true },
  ];

  const seededGroups: Record<string, string> = {};

  for (const group of packageGroups) {
    const record = await prisma.packageGroup.upsert({
      where: { name: group.name },
      update: { isActive: group.isActive },
      create: group,
    });
    seededGroups[group.name] = record.id;
  }

  const defaultPackages = [
    { group: "Regular", buttons: 66, topupAmount: 60, price: 30 },
    { group: "Regular", buttons: 203, topupAmount: 200, price: 90 },
    { group: "Regular", buttons: 335, topupAmount: 305, price: 145 },
    { group: "Regular", buttons: 759, topupAmount: 690, price: 290 },
    { group: "Regular", buttons: 2227, topupAmount: 2025, price: 840 },
    { group: "Regular", buttons: 3663, topupAmount: 3330, price: 1375 },
    { group: "Regular", buttons: 7249, topupAmount: 6590, price: 2725 },
    { group: "Discount 3%", buttons: 335, topupAmount: 305, price: 140 },
    { group: "Discount 3%", buttons: 759, topupAmount: 690, price: 285 },
    { group: "Discount 3%", buttons: 2227, topupAmount: 2025, price: 835 },
    { group: "Discount 3%", buttons: 3663, topupAmount: 3330, price: 1370 },
    { group: "Discount 3%", buttons: 7249, topupAmount: 6590, price: 2720 },
    { group: "Discount 10%", buttons: 335, topupAmount: 305, price: 137 },
    { group: "Discount 10%", buttons: 759, topupAmount: 690, price: 275 },
    { group: "Discount 10%", buttons: 2227, topupAmount: 2025, price: 790 },
    { group: "Discount 10%", buttons: 3663, topupAmount: 3330, price: 1300 },
    { group: "Discount 10%", buttons: 7249, topupAmount: 6590, price: 2580 },
    { group: "Pre-order", buttons: 66, topupAmount: 60, price: 28 },
    { group: "Pre-order", buttons: 203, topupAmount: 200, price: 85 },
    { group: "Pre-order", buttons: 335, topupAmount: 305, price: 140 },
    { group: "Pre-order", buttons: 759, topupAmount: 690, price: 280 },
  ];

  for (const pkg of defaultPackages) {
    const packageGroupId = seededGroups[pkg.group];
    const existing = await prisma.package.findFirst({
      where: {
        packageGroupId,
        buttons: pkg.buttons,
      },
    });

    if (existing) {
      await prisma.package.update({
        where: { id: existing.id },
        data: {
          topupAmount: pkg.topupAmount,
          price: pkg.price,
        },
      });
    } else {
      await prisma.package.create({
        data: {
          buttons: pkg.buttons,
          topupAmount: pkg.topupAmount,
          price: pkg.price,
          packageGroupId,
        },
      });
    }
  }

  console.log("Seed completed successfully.");
  if (process.env.NODE_ENV !== "production") {
    console.log(`Head admin: ${HEAD_ADMIN_USERNAME}`);
    console.log("Sub-admins: admin2, admin3");
    if (!process.env.SEED_ADMIN_PASSWORD) {
      console.log(`Default dev password: ${DEFAULT_SEED_PASSWORD}`);
    }
  } else {
    console.log("Admin accounts seeded. Password was taken from SEED_ADMIN_PASSWORD.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
