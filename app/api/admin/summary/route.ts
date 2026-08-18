import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { getAdminSummary } from "@/lib/queries/adminSummary";

export async function GET() {
  const { session, response } = await requireAdmin();
  if (!session) return response;

  const summary = await getAdminSummary();
  return NextResponse.json(summary);
}
