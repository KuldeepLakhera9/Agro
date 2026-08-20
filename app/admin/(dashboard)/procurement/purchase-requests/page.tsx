import Link from "next/link";
import { getAdminTranslations } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import PurchaseRequest, { PURCHASE_REQUEST_STATUSES } from "@/lib/models/PurchaseRequest";

export default async function PurchaseRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  await connectDB();
  const t = await getAdminTranslations("Admin.Procurement");
  const tCommon = await getAdminTranslations("Admin.Common");

  const query: Record<string, unknown> = {};
  if (status && (PURCHASE_REQUEST_STATUSES as readonly string[]).includes(status)) {
    query.status = status;
  }
  const requests = await PurchaseRequest.find(query).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-800">{t("requestsTitle")}</h1>
        <Link
          href="/admin/procurement/purchase-requests/new"
          className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          {t("newRequest")}
        </Link>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/admin/procurement/purchase-requests"
          className={`rounded-full px-3 py-1 text-sm font-medium ${!status ? "bg-brand-600 text-white" : "bg-white text-foreground/70"}`}
        >
          {t("all")}
        </Link>
        {PURCHASE_REQUEST_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/procurement/purchase-requests?status=${s}`}
            className={`rounded-full px-3 py-1 text-sm font-medium ${status === s ? "bg-brand-600 text-white" : "bg-white text-foreground/70"}`}
          >
            {t(`status_${s}` as never)}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-earth-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-earth-200 text-left text-foreground/50">
            <tr>
              <th className="px-4 py-3">{t("colProduct")}</th>
              <th className="px-4 py-3">{t("colNeeded")}</th>
              <th className="px-4 py-3">{t("colSentTo")}</th>
              <th className="px-4 py-3">{t("colResponses")}</th>
              <th className="px-4 py-3">{tCommon("status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {requests.map((r) => (
              <tr key={String(r._id)} className="hover:bg-earth-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/procurement/purchase-requests/${r._id}`}
                    className="font-medium text-brand-700 hover:underline"
                  >
                    {r.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-foreground/70">{r.quantityNeeded} {r.unit}</td>
                <td className="px-4 py-3 text-foreground/70">{r.sentTo.length}</td>
                <td className="px-4 py-3 text-foreground/70">{r.responses.length}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    {t(`status_${r.status}` as never)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">{t("noRequests")}</p>
        )}
      </div>
    </div>
  );
}
