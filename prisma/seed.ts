import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const warehouseName = process.env.ACTIVE_WAREHOUSE_NAME || "Dallas Warehouse";
  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "change-me-before-deploy";
  const warehouse = await prisma.warehouse.upsert({ where: { name: warehouseName }, update: { active: true }, create: { name: warehouseName, active: true } });
  await prisma.appSetting.upsert({ where: { key: "activeWarehouseId" }, update: { value: warehouse.id }, create: { key: "activeWarehouseId", value: warehouse.id } });
  await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: "Admin", role: UserRole.ADMIN, passwordHash: await bcrypt.hash(password, 12) } });
}

main().finally(async () => { await prisma.$disconnect(); }).catch(async (error) => { console.error(error); await prisma.$disconnect(); process.exit(1); });
