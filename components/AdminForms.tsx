"use client";

import { useState } from "react";
import { Database, MapPin, Save, Upload } from "lucide-react";

type Warehouse = { id: string; name: string };
type Bin = { id: string; label: string; isHold: boolean; shipstationInventoryLocationId: string | null };

export function ImportForm({ type }: { type: "product" | "inventory" }) {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) { setMessage("Importing..."); const response = await fetch(`/api/import/${type}`, { method: "POST", body: formData }); const body = await response.json(); setMessage(response.ok ? `Imported ${body.rowCount} rows with ${body.warningCount} warnings.` : body.error); }
  return <form action={submit} className="stack"><label className="field"><span>{type === "product" ? "Product CSV" : "Inventory CSV"}</span><input name="file" type="file" accept=".csv,text/csv" required /></label><button className="secondary" type="submit"><Upload size={18} />Import {type}</button>{message ? <div className="notice">{message}</div> : null}</form>;
}

export function BinForm({ warehouses }: { warehouses: Warehouse[] }) {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) { setMessage("Saving..."); const payload = { warehouseId: String(formData.get("warehouseId")), zone: String(formData.get("zone") || ""), aisle: String(formData.get("aisle") || ""), rack: String(formData.get("rack") || ""), level: String(formData.get("level") || ""), shipstationInventoryLocationId: String(formData.get("shipstationInventoryLocationId")), isHold: formData.get("isHold") === "on" }; const response = await fetch("/api/admin/bins", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); const body = await response.json(); setMessage(response.ok ? `Saved ${body.label}.` : body.error); }
  return <form action={submit} className="stack"><label className="field"><span>Warehouse</span><select name="warehouseId" required>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label><div className="grid"><label className="field"><span>Zone</span><input name="zone" placeholder="Loc1" /></label><label className="field"><span>Aisle</span><input name="aisle" placeholder="Loc2" /></label><label className="field"><span>Rack</span><input name="rack" placeholder="Loc3" /></label><label className="field"><span>Level</span><input name="level" placeholder="Loc4" /></label></div><label className="field"><span>ShipStation inventory location ID</span><input name="shipstationInventoryLocationId" required /></label><label><input name="isHold" type="checkbox" /> Receiving hold location</label><button className="secondary" type="submit"><MapPin size={18} />Save location</button>{message ? <div className="notice">{message}</div> : null}</form>;
}

export function SettingsForm({ warehouses, bins, activeWarehouseId, receivingHoldBinLocationId }: { warehouses: Warehouse[]; bins: Bin[]; activeWarehouseId?: string | null; receivingHoldBinLocationId?: string | null; }) {
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) { setMessage("Saving..."); const response = await fetch("/api/admin/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ activeWarehouseId: String(formData.get("activeWarehouseId")), receivingHoldBinLocationId: String(formData.get("receivingHoldBinLocationId")) }) }); const body = await response.json(); setMessage(response.ok ? "Settings saved." : body.error); }
  return <form action={submit} className="stack"><label className="field"><span>Active warehouse</span><select name="activeWarehouseId" defaultValue={activeWarehouseId || ""} required>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></label><label className="field"><span>Receiving hold location</span><select name="receivingHoldBinLocationId" defaultValue={receivingHoldBinLocationId || ""} required><option value="">Choose hold location</option>{bins.map((bin) => <option key={bin.id} value={bin.id}>{bin.label}</option>)}</select></label><button className="button" type="submit"><Save size={18} />Save settings</button>{message ? <div className="notice">{message}</div> : null}</form>;
}

export function DataCounts({ products, bins, receipts }: { products: number; bins: number; receipts: number }) {
  return <div className="row"><span className="pill"><Database size={14} /> {products} products</span><span className="pill">{bins} bins</span><span className="pill">{receipts} receipts</span></div>;
}
