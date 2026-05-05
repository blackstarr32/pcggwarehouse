"use server";

import { redirect } from "next/navigation";
import { clearSession, createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(_previousState: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const user = await prisma.user.findFirst({ where: { email, active: true } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return { error: "Email or password is incorrect." };
  await createSession(user.id, user.role);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}
