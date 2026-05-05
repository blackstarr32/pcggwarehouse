"use server";

import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { clearSession, createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function loginAction(_previousState: { error?: string } | null, formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  await ensureDefaultAdmin();

  const user = await prisma.user.findFirst({ where: { email, active: true } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return { error: "Email or password is incorrect." };
  await createSession(user.id, user.role);
  redirect("/");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

async function ensureDefaultAdmin() {
  const userCount = await prisma.user.count();
  if (userCount > 0) return;

  const email = process.env.DEFAULT_ADMIN_EMAIL;
  const password = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!email || !password) return;

  await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      name: "Admin",
      role: UserRole.ADMIN,
      passwordHash: await hashPassword(password)
    }
  });
}
