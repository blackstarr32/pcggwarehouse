import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { setSetting } from "@/lib/settings";

const schema = z.object({ activeWarehouseId: z.string().min(1), receivingHoldBinLocationId: z.string().min(1) });

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Choose an active warehouse and receiving hold location." }, { status: 400 });
  const holdBin = await prisma.binLocation.findFirst({ where: { id: parsed.data.receivingHoldBinLocationId, warehouseId: parsed.data.activeWarehouseId } });
  if (!holdBin) return NextResponse.json({ error: "Receiving hold location must belong to the active warehouse." }, { status: 400 });
  await prisma.warehouse.updateMany({ data: { active: false } });
  await prisma.warehouse.update({ where: { id: parsed.data.activeWarehouseId }, data: { active: true } });
  await setSetting("activeWarehouseId", parsed.data.activeWarehouseId);
  await setSetting("receivingHoldBinLocationId", parsed.data.receivingHoldBinLocationId);
  return NextResponse.json({ ok: true });
}
