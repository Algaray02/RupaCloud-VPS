import { PrismaClient, Role, OrderStatus, TransactionType, PaymentMethod, TransactionStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding for RuPa Cloud...");

  // 1. Clear existing records safely
  await prisma.transaction.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.tutorialPref.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.plan.deleteMany({});
  await prisma.appConfig.deleteMany({});

  // Fixed password hash for testing (Password123! for customers, Admin123! for admin)
  const customerPasswordHash = "$2b$10$9ioFOYzTsJLcT.iYxzadaechxPDqlBFwg5OADmwAhQhKpgADbtSIm";
  const adminPasswordHash = "$2b$10$5IIIYlE6g1M3jy1FTzunNufgR1Iqd4iNmJIY3aSLnPio3z386iq0K";

  // 2. Seed Admin User (1 Admin)
  const adminUser = await prisma.user.create({
    data: {
      id: "usr_admin_master",
      name: "Master Admin RuPa Cloud",
      email: "admin@rupacloud.id",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      balance: 1000000,
      suspended: false,
    },
  });
  console.log(`✅ Seeded 1 Admin User: ${adminUser.email}`);

  // 3. Seed 5 Customer Users (5 Customers)
  const customer1 = await prisma.user.create({
    data: {
      id: "usr_cust_1",
      name: "Budi Santoso (Student)",
      email: "budi@student.univ.ac.id",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      balance: 50000,
      githubHandle: "budisantoso-dev",
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      id: "usr_cust_2",
      name: "Siti Aminah (Bot Developer)",
      email: "siti@botdev.io",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      balance: 120000,
      githubHandle: "sitibot",
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      id: "usr_cust_3",
      name: "Rizky Pratama (CTF Player)",
      email: "rizky@ctfplayer.com",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      balance: 3500,
      githubHandle: "rizky-sec",
    },
  });

  const customer4 = await prisma.user.create({
    data: {
      id: "usr_cust_4",
      name: "Dewi Lestari (Frontend Learner)",
      email: "dewi@webdev.id",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      balance: 75000,
      githubHandle: "dewi-frontend",
    },
  });

  const customer5 = await prisma.user.create({
    data: {
      id: "usr_cust_5",
      name: "Andi Wijaya (Fullstack Dev)",
      email: "andi@fullstack.dev",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      balance: 0,
      githubHandle: "andiwijaya",
    },
  });
  console.log("✅ Seeded 5 Customer Users: Budi, Siti, Rizky, Dewi, Andi");

  // 4. Seed Plans (Katalog Matriks)
  const planStarter1 = await prisma.plan.create({
    data: {
      id: "plan-starter-1d",
      name: "Starter 1 Hari",
      durationDays: 1,
      ramMb: 512,
      cpuAllowance: 25,
      storageGb: 10,
      price: 3500,
      tier: "Starter",
      active: true,
    },
  });

  const planStarter3 = await prisma.plan.create({
    data: {
      id: "plan-starter-3d",
      name: "Starter 3 Hari",
      durationDays: 3,
      ramMb: 512,
      cpuAllowance: 25,
      storageGb: 10,
      price: 10000,
      tier: "Starter",
      active: true,
    },
  });

  const planStarter7 = await prisma.plan.create({
    data: {
      id: "plan-starter-7d",
      name: "Starter 7 Hari",
      durationDays: 7,
      ramMb: 512,
      cpuAllowance: 25,
      storageGb: 10,
      price: 22000,
      tier: "Starter",
      active: true,
    },
  });

  const planBasic3 = await prisma.plan.create({
    data: {
      id: "plan-basic-3d",
      name: "Basic 3 Hari",
      durationDays: 3,
      ramMb: 1024,
      cpuAllowance: 50,
      storageGb: 20,
      price: 17000,
      tier: "Basic",
      active: true,
    },
  });

  const planPro7 = await prisma.plan.create({
    data: {
      id: "plan-pro-7d",
      name: "Pro 7 Hari",
      durationDays: 7,
      ramMb: 2048,
      cpuAllowance: 100,
      storageGb: 40,
      price: 75000,
      tier: "Pro",
      active: true,
    },
  });
  console.log("✅ Seeded Plans (Starter, Basic, Pro)");

  // 5. Seed Initial Orders
  const now = new Date();
  const order1 = await prisma.order.create({
    data: {
      id: "ord-1001",
      userId: customer1.id,
      planId: planStarter3.id,
      status: OrderStatus.ACTIVE,
      containerId: "lxd-cont-node01-401",
      ipAddress: "103.147.22.101",
      subdomain: "budi-node.rupacloud.id",
      startedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    },
  });

  const order2 = await prisma.order.create({
    data: {
      id: "ord-1002",
      userId: customer2.id,
      planId: planBasic3.id,
      status: OrderStatus.EXPIRING_SOON,
      containerId: "lxd-cont-node02-802",
      ipAddress: "103.147.22.105",
      subdomain: "siti-bot.rupacloud.id",
      startedAt: new Date(now.getTime() - 68 * 60 * 60 * 1000),
      expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
    },
  });

  console.log("✅ Seeded Initial Orders");

  // 6. Seed Initial Transactions
  await prisma.transaction.create({
    data: {
      id: "tx-5001",
      userId: customer1.id,
      type: TransactionType.TOPUP,
      amount: 50000,
      method: PaymentMethod.GATEWAY,
      status: TransactionStatus.SUCCESS,
      gatewayRef: "QRIS-PAY-992120",
    },
  });

  await prisma.transaction.create({
    data: {
      id: "tx-5002",
      userId: customer1.id,
      type: TransactionType.RENTAL,
      amount: 10000,
      method: PaymentMethod.BALANCE,
      status: TransactionStatus.SUCCESS,
      orderId: order1.id,
    },
  });

  console.log("✅ Seeded Initial Transactions");

  // 7. Seed App Configuration
  await prisma.appConfig.createMany({
    data: [
      { key: "maintenance_mode", value: "false" },
      { key: "announcement_banner", value: "Selamat Datang di RuPa Cloud - Platform Sewa VPS Mikro Harian!" },
      { key: "default_quota_per_user", value: "5" },
    ],
  });
  console.log("✅ Seeded App Configurations");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
