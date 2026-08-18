import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function requireAdmin() {
  const session = await getSession();
  if (!session?.isAdmin) {
    return { session: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}
