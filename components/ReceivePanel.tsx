"use client";

import { useCallback, useMemo, useState } from "react";
import { Check, PackageCheck, Search } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";

type BinOption = { id: string; label: string; zone: string; aisle: string; rack: string; level: string; isHold: boolean; shipstationInventoryLocationId: string | null; };

export function ReceivePanel({ bins }: { bins: BinOption[] }) {
  const [binLocationId, setBinLocationId] = useState("");
  const [skippedBin, setSkippedBin] = useState(false);
  const [upc, setUpc] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  const selectedBin = useMemo(() => bins.find((bin) => bin.id === binLocationId), [bins, binLocationId]);
  const onScan = useCallback((value: string) => setUpc(value.replace(/\D/g, "")), []);
  async function submit() {
    setPending(true); setMessage(null);
    const response = await fetch("/api/receive", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ upc, quantity, binLocationId: skippedBin ? null : binLocationId, skippedBin }) });
    const body = await response.json(); setPending(false);
    if (!response.ok) { setMessage({ type: "error", text: body.error || "Receiving failed." }); return; }
    setMessage({ type: "success", text: `Received ${body.quantity} of ${body.productName} (${body.sku}).` }); setUpc(""); setQuantity(1);
  }
  return <section className="grid"><div className="card stack"><div className="row"><div><h1>Receive Inventory</h1><p className="muted">Scan UPC barcodes with the tablet or phone camera.</p></div><span className="pill">{skippedBin ? "Receiving Hold" : selectedBin?.label || "No bin selected"}</span></div><BarcodeScanner onScan={onScan} /><label className="field"><span>Scanned UPC</span><input value={upc} onChange={(event) => setUpc(event.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Scan or type UPC" /></label><label className="field"><span>Quantity received</span><input value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} min={1} type="number" inputMode="numeric" /></label>{message ? <div className={message.type}>{message.text}</div> : null}<button className="button" type="button" onClick={submit} disabled={pending || !upc || (!skippedBin && !binLocationId)}><PackageCheck size={18} />{pending ? "Syncing" : "Receive into ShipStation"}</button></div><aside className="card stack"><h2>Bin Context</h2><label className="field"><span>Active bin</span><select value={binLocationId} onChange={(event) => setBinLocationId(event.target.value)} disabled={skippedBin}><option value="">Choose bin</option>{bins.filter((bin) => !bin.isHold).map((bin) => <option key={bin.id} value={bin.id}>{bin.label || [bin.zone, bin.aisle, bin.rack, bin.level].filter(Boolean).join("-")}</option>)}</select></label><button className={skippedBin ? "danger" : "secondary"} type="button" onClick={() => { setSkippedBin((value) => !value); setBinLocationId(""); }}>{skippedBin ? <Check size={18} /> : <Search size={18} />}{skippedBin ? "Using receiving hold" : "Skip bin"}</button><div className="notice">Skipped-bin receipts go to the configured receiving hold location and stay flagged for later bin assignment.</div></aside></section>;
}
