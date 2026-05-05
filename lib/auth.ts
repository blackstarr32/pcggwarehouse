import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "inventory_session";
type SessionPayload = { userId: string; role: UserRole };
function authSecret() { const secret = process.env.AUTH_SECRET; if (!secret) throw new Error("AUTH_SECRET is required."); return secret; }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }
export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function createSession(userId: string, role: UserRole) { const token = jwt.sign({ userId, role } satisfies SessionPayload, authSecret(), { expiresIn: "12h" }); const cookieStore = await cookies(); cookieStore.set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 12 }); }
export async function clearSession() { const cookieStore = await cookies(); cookieStore.delete(COOKIE_NAME); }
export async function getCurrentUser() { const cookieStore = await cookies(); const token = cookieStore.get(COOKIE_NAME)?.value; if (!token) return null; try { const payload = jwt.verify(token, authSecret()) as SessionPayload; return prisma.user.findFirst({ where: { id: payload.userId, active: true }, select: { id: true, email: true, name: true, role: true } }); } catch { return null; } }
export async function requireUser() { const user = await getCurrentUser(); if (!user) redirect("/login"); return user; }
export async function requireAdmin() { const user = await requireUser(); if (user.role !== UserRole.ADMIN) redirect("/"); return user; }
