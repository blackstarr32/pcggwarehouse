import Link from "next/link";
import { LogOut, Settings, ScanLine } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return <main className="shell"><header className="topbar"><div className="brand"><strong>Inventory Receiving</strong><span>{user.email}</span></div><nav className="nav" aria-label="Main navigation"><Link href="/"><ScanLine size={18} />Receive</Link><Link href="/admin"><Settings size={18} />Admin</Link><form action={logoutAction}><button type="submit"><LogOut size={18} />Sign out</button></form></nav></header>{children}</main>;
}
