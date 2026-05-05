import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { importProductCsv } from "@/lib/importers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Upload a Product CSV file." }, { status: 400 });
  const result = await importProductCsv(prisma, await file.text(), file.name);
  return NextResponse.json(result);
}
