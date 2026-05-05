"use client";

import { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { Camera, CameraOff } from "lucide-react";

export function BarcodeScanner({ onScan }: { onScan: (value: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!active || !videoRef.current) return;
    const reader = new BrowserMultiFormatReader();
    let stopped = false;
    let stopControls: { stop: () => void } | null = null;
    reader.decodeFromVideoDevice(undefined, videoRef.current, (result) => { if (result && !stopped) onScan(result.getText()); }).then((controls) => { stopControls = controls; }).catch((scanError) => { setError(scanError instanceof Error ? scanError.message : "Camera could not start."); setActive(false); });
    return () => { stopped = true; stopControls?.stop(); };
  }, [active, onScan]);
  return <div className="stack"><div className="scanner">{active ? <video ref={videoRef} muted playsInline /> : null}<div className="scanLine" /></div>{error ? <div className="error">{error}</div> : null}<button className={active ? "danger" : "secondary"} type="button" onClick={() => setActive((value) => !value)}>{active ? <CameraOff size={18} /> : <Camera size={18} />}{active ? "Stop camera" : "Start camera"}</button></div>;
}
