import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ADMIN_ROLES, type Role } from "@/lib/roles";

export async function requireRole(allowed: Role[]) {
  const session = await getSession();
  if (!session || !allowed.includes(session.role)) {
    return { session: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { session, response: null };
}

export function requireAdmin() {
  return requireRole(ADMIN_ROLES);
}

export function requireOwner() {
  return requireRole(["owner"]);
}
