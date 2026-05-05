import { ReceivePanel } from "@/components/ReceivePanel";
import { prisma } from "@/lib/prisma";
import { getActiveWarehouse } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const warehouse = await getActiveWarehouse();
  const bins = await prisma.binLocation.findMany({ where: { warehouseId: warehouse.id, active: true }, orderBy: [{ isHold: "asc" }, { label: "asc" }], select: { id: true, label: true, zone: true, aisle: true, rack: true, level: true, isHold: true, shipstationInventoryLocationId: true } });
  const recent = await prisma.receipt.findMany({ take: 8, orderBy: { createdAt: "desc" }, include: { product: true, binLocation: true, user: true } });
  return <div className="content stack">{bins.length === 0 ? <div className="notice">An admin needs to import CSV data and configure at least one ShipStation inventory location before receiving.</div> : null}<ReceivePanel bins={bins} /><section className="card stack"><div className="row"><h2>Recent Receipts</h2><span className="pill">{warehouse.name}</span></div><table className="table"><thead><tr><th>Time</th><th>SKU</th><th>Qty</th><th>Location</th><th>Status</th></tr></thead><tbody>{recent.map((receipt) => <tr key={receipt.id}><td>{receipt.createdAt.toLocaleString()}</td><td>{receipt.sku}</td><td>{receipt.quantity}</td><td>{receipt.binLocation?.label || "Receiving Hold"}</td><td>{receipt.status}</td></tr>)}{recent.length === 0 ? <tr><td colSpan={5}>No receipts yet.</td></tr> : null}</tbody></table></section></div>;
}
