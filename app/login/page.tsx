"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction } from "@/app/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, null);
  return <main className="login"><form action={formAction} className="card stack"><div className="brand"><strong>Inventory Receiving</strong><span>Sign in to receive stock into ShipStation.</span></div>{state?.error ? <div className="error">{state.error}</div> : null}<label className="field"><span>Email</span><input name="email" type="email" autoComplete="email" required /></label><label className="field"><span>Password</span><input name="password" type="password" autoComplete="current-password" required /></label><button className="button" type="submit" disabled={pending}><LogIn size={18} />{pending ? "Signing in" : "Sign in"}</button></form></main>;
}
