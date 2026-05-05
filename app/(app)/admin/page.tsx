import { DataCounts, BinForm, ImportForm, SettingsForm } from "@/components/AdminForms";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSetting } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const [warehouses, bins, products, receipts, imports, pendingReceipts, activeWarehouseId, receivingHoldBinLocationId] = await Promise.all([
    prisma.warehouse.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.binLocation.findMany({ orderBy: [{ isHold: "desc" }, { label: "asc" }], select: { id: true, label: true, isHold: true, shipstationInventoryLocationId: true } }),
    prisma.product.count(),
    prisma.receipt.count(),
    prisma.importBatch.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
    prisma.receipt.findMany({ where: { skippedBin: true }, take: 10, orderBy: { createdAt: "desc" }, include: { product: true, binLocation: true } }),
    getSetting("activeWarehouseId"),
    getSetting("receivingHoldBinLocationId")
  ]);
  return <div className="content stack"><section className="card stack"><div className="row"><div><h1>Admin Setup</h1><p className="muted">Import ShipStation CSV data and configure warehouse receiving.</p></div></div><DataCounts products={products} bins={bins.length} receipts={receipts} /></section><section className="grid"><div className="card stack"><h2>CSV Import</h2><ImportForm type="product" /><ImportForm type="inventory" /></div><div className="card stack"><h2>Warehouse Settings</h2><SettingsForm warehouses={warehouses} bins={bins} activeWarehouseId={activeWarehouseId} receivingHoldBinLocationId={receivingHoldBinLocationId} /></div></section><section className="card stack"><h2>Create or Update Bin</h2><BinForm warehouses={warehouses} /></section><section className="grid"><div className="card stack"><h2>Recent Imports</h2><table className="table"><thead><tr><th>Type</th><th>Rows</th><th>Warnings</th></tr></thead><tbody>{imports.map((batch) => <tr key={batch.id}><td>{batch.type}</td><td>{batch.rowCount}</td><td>{batch.warningCount}</td></tr>)}</tbody></table></div><div className="card stack"><h2>Skipped-Bin Receipts</h2><table className="table"><thead><tr><th>SKU</th><th>Qty</th><th>Status</th></tr></thead><tbody>{pendingReceipts.map((receipt) => <tr key={receipt.id}><td>{receipt.sku}</td><td>{receipt.quantity}</td><td>{receipt.status}</td></tr>)}{pendingReceipts.length === 0 ? <tr><td colSpan={3}>No skipped-bin receipts.</td></tr> : null}</tbody></table></div></section></div>;
}
