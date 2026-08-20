import { connectDB } from "@/lib/db";
import AuditLog from "@/lib/models/AuditLog";

export type AuditAction =
  | "purchase_request_created"
  | "purchase_request_sent"
  | "purchase_request_reminder_sent"
  | "farmer_offer_accepted"
  | "farmer_offer_rejected"
  | "goods_receipt_recorded"
  | "payment_marked_paid"
  | "farmer_created"
  | "farmer_updated"
  | "product_stock_edited"
  | "user_role_changed";

export async function logAudit(entry: {
  userId: string;
  action: AuditAction;
  targetType: string;
  targetId?: string;
  details?: unknown;
}) {
  await connectDB();
  await AuditLog.create({
    userId: entry.userId,
    action: entry.action,
    targetType: entry.targetType,
    targetId: entry.targetId,
    details: entry.details,
  });
}
