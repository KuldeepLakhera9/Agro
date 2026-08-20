import Link from "next/link";
import { getAdminTranslations } from "@/lib/adminLocale";
import { requireOwnerPage } from "@/lib/auth/requirePageRole";
import { connectDB } from "@/lib/db";
import AuditLog from "@/lib/models/AuditLog";
import User from "@/lib/models/User";

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string }>;
}) {
  await requireOwnerPage();
  const { action } = await searchParams;
  await connectDB();
  const t = await getAdminTranslations("Admin.AuditLog");

  const query: Record<string, unknown> = {};
  if (action) query.action = action;

  const [entries, actions] = await Promise.all([
    AuditLog.find(query).sort({ createdAt: -1 }).limit(200).lean(),
    AuditLog.distinct("action"),
  ]);
  const userIds = [...new Set(entries.map((e) => String(e.userId)))];
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const phoneById = new Map(users.map((u) => [String(u._id), u.phone]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/audit-log"
          className={`rounded-full px-3 py-1 text-sm font-medium ${!action ? "bg-brand-600 text-white" : "bg-white text-foreground/70"}`}
        >
          {t("all")}
        </Link>
        {actions.map((a) => (
          <Link
            key={a}
            href={`/admin/audit-log?action=${a}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${action === a ? "bg-brand-600 text-white" : "bg-white text-foreground/70"}`}
          >
            {a.replace(/_/g, " ")}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-earth-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-earth-200 text-left text-foreground/50">
            <tr>
              <th className="px-4 py-3">{t("colWhen")}</th>
              <th className="px-4 py-3">{t("colBy")}</th>
              <th className="px-4 py-3">{t("colAction")}</th>
              <th className="px-4 py-3">{t("colTarget")}</th>
              <th className="px-4 py-3">{t("colDetails")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {entries.map((e) => (
              <tr key={String(e._id)}>
                <td className="px-4 py-3 text-foreground/70">
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-foreground/70">{phoneById.get(String(e.userId)) ?? "—"}</td>
                <td className="px-4 py-3 font-medium">{e.action.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-foreground/70">
                  {e.targetType}
                  {e.targetId ? ` · ${String(e.targetId).slice(-6)}` : ""}
                </td>
                <td className="px-4 py-3 text-xs text-foreground/50">
                  {e.details ? JSON.stringify(e.details) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">{t("noEntries")}</p>
        )}
      </div>
    </div>
  );
}
