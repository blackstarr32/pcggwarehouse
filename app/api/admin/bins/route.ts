import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { buildBinLabel } from "@/lib/identifiers";
import { prisma } from "@/lib/prisma";

const schema = z.object({ warehouseId: z.string().min(1), zone: z.string().default(""), aisle: z.string().default(""), rack: z.string().default(""), level: z.string().default(""), shipstationInventoryLocationId: z.string().min(1), isHold: z.boolean().default(false) });

export async function POST(request: Request) {
  await requireAdmin();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Complete the bin fields and ShipStation inventory location ID." }, { status: 400 });
  const { warehouseId, zone, aisle, rack, level, shipstationInventoryLocationId, isHold } = parsed.data;
  const label = isHold ? "Receiving Hold" : buildBinLabel(zone, aisle, rack, level);
  if (!isHold && !label) return NextResponse.json({ error: "Enter at least one bin field." }, { status: 400 });
  const bin = await prisma.binLocation.upsert({ where: { warehouseId_zone_aisle_rack_level: { warehouseId, zone, aisle, rack, level } }, update: { label, shipstationInventoryLocationId, isHold, active: true }, create: { warehouseId, zone, aisle, rack, level, label, shipstationInventoryLocationId, isHold } });
  return NextResponse.json(bin);
}
