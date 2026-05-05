import { ReceiptStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeIdentifier } from "@/lib/identifiers";
import { getActiveWarehouse, getReceivingHoldLocation } from "@/lib/settings";
import { incrementInventory } from "@/lib/shipstation";

export async function receiveInventory(input: { userId: string; upc: string; quantity: number; binLocationId?: string | null; skippedBin: boolean; }) {
  const quantity = Number(input.quantity);
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error("Quantity must be a whole number greater than zero.");
  const upc = normalizeIdentifier(input.upc, { field: "UPC", expectedLengths: [12, 14] });
  if (!upc.value || upc.warnings.some((warning) => warning.includes("non-numeric") || warning.includes("length"))) throw new Error(upc.warnings[0] || "UPC is invalid.");
  const warehouse = await getActiveWarehouse();
  const productUpc = await prisma.productUpc.findFirst({ where: { upc: upc.value, product: { warehouseId: warehouse.id, active: true } }, include: { product: true } });
  if (!productUpc) throw new Error(`UPC ${upc.value} is not mapped to a ShipStation SKU.`);
  const targetBin = input.skippedBin ? await getReceivingHoldLocation(warehouse.id) : input.binLocationId ? await prisma.binLocation.findFirst({ where: { id: input.binLocationId, warehouseId: warehouse.id, active: true } }) : null;
  if (!targetBin) throw new Error(input.skippedBin ? "Receiving hold location is not configured." : "Choose a bin or use skip bin.");
  if (!targetBin.shipstationInventoryLocationId) throw new Error(`ShipStation inventory location ID is missing for ${targetBin.label || "the selected location"}.`);
  const receipt = await prisma.receipt.create({ data: { userId: input.userId, productId: productUpc.productId, warehouseId: warehouse.id, binLocationId: targetBin.id, scannedUpc: upc.value, sku: productUpc.product.sku, quantity, skippedBin: input.skippedBin, status: ReceiptStatus.PENDING } });
  try { const result = await incrementInventory({ sku: productUpc.product.sku, quantity, inventory_location_id: targetBin.shipstationInventoryLocationId }); return prisma.receipt.update({ where: { id: receipt.id }, data: { status: ReceiptStatus.SYNCED, shipstationRequest: result.payload, shipstationResponse: result.response ?? {}, syncedAt: new Date() }, include: { product: true, binLocation: true } }); }
  catch (error) { await prisma.receipt.update({ where: { id: receipt.id }, data: { status: ReceiptStatus.FAILED, errorMessage: error instanceof Error ? error.message : "Unknown ShipStation error" } }); throw error; }
}
