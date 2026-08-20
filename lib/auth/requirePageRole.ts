import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "@/lib/auth/session";
import { ADMIN_ROLES, type Role } from "@/lib/roles";

async function requirePageRole(allowed: Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session || !allowed.includes(session.role)) {
    redirect(session ? "/admin" : "/admin/login");
  }
  return session;
}

export function requireAdminPage() {
  return requirePageRole(ADMIN_ROLES);
}

export function requireOwnerPage() {
  return requirePageRole(["owner"]);
}
