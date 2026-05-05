import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { receiveInventory } from "@/lib/receive";

const schema = z.object({ upc: z.string().min(1), quantity: z.coerce.number().int().positive(), binLocationId: z.string().nullable().optional(), skippedBin: z.boolean() });

export async function POST(request: Request) {
  const user = await requireUser();
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Check the UPC, bin, and quantity." }, { status: 400 });
  try {
    const receipt = await receiveInventory({ ...parsed.data, userId: user.id });
    return NextResponse.json({ id: receipt.id, sku: receipt.sku, productName: receipt.product.name, quantity: receipt.quantity, location: receipt.binLocation?.label, status: receipt.status });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Receiving failed." }, { status: 400 });
  }
}
