import { NextResponse } from "next/server";
import { clearCajaCookie } from "@/lib/caja/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  await clearCajaCookie();
  return NextResponse.json({ ok: true });
}
