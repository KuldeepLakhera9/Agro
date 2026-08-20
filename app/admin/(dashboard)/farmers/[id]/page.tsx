import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminTranslations } from "@/lib/adminLocale";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import Farmer from "@/lib/models/Farmer";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import FarmerOffer from "@/lib/models/FarmerOffer";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
import { formatPrice } from "@/lib/format";
import MarkPaymentButton from "@/components/admin/MarkPaymentButton";
import RateFarmerButton from "@/components/admin/RateFarmerButton";

const PAYMENT_MODE_KEY: Record<string, string> = {
  cash: "paymentCash",
  upi: "paymentUpi",
  bank_transfer: "paymentBank",
};

export default async function FarmerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  await connectDB();

  const farmer = await Farmer.findById(id).lean();
  if (!farmer) notFound();
  const [t, tCommon, tProcurement] = await Promise.all([
    getAdminTranslations("Admin.Farmers"),
    getAdminTranslations("Admin.Common"),
    getAdminTranslations("Admin.Procurement"),
  ]);

  const offers = await FarmerOffer.find({ farmerId: id }).sort({ createdAt: -1 }).lean();
  const requestIds = offers.map((o) => o.purchaseRequestId);
  const requests = await PurchaseRequest.find({ _id: { $in: requestIds } }).lean();
  const requestById = new Map(requests.map((r) => [String(r._id), r]));

  const isOwner = session?.role === "owner";
  const receipts = isOwner
    ? await GoodsReceipt.find({ farmerId: id }).sort({ createdAt: -1 }).lean()
    : [];
  const totalOwed = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPaid = receipts.reduce((sum, r) => sum + r.amountPaid, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">{farmer.name}</h1>
          <p className="text-sm text-foreground/60">
            {farmer.phone} · {farmer.village || "—"}, {farmer.taluka || "—"}
          </p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <Link
              href={`/admin/farmers/${id}/statement`}
              className="rounded-full border border-earth-300 px-4 py-2 text-sm font-semibold text-earth-700 hover:bg-earth-50"
            >
              {t("statement")}
            </Link>
          )}
          <Link
            href={`/admin/farmers/${id}/edit`}
            className="rounded-full border border-brand-300 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
          >
            {tCommon("edit")}
          </Link>
          <Link
            href={`/admin/farmers/${id}/purchase/new`}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {t("recordPurchase")}
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("profile")}</h2>
          <dl className="mt-3 space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-foreground/60">{t("district_label")}</dt><dd>{farmer.district || "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground/60">{t("paymentMode")}</dt><dd>{t(PAYMENT_MODE_KEY[farmer.preferredPaymentMode] as never)}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground/60">{t("rating")}</dt><dd>{farmer.rating ? `★ ${farmer.rating.toFixed(1)} (${farmer.ratingCount})` : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground/60">{t("verified_label")}</dt><dd>{farmer.isVerified ? t("yes") : t("no")}</dd></div>
            <div className="flex justify-between"><dt className="text-foreground/60">{t("status")}</dt><dd>{farmer.isActive ? tCommon("active") : tCommon("inactive")}</dd></div>
          </dl>
          {farmer.notes && <p className="mt-3 text-sm text-foreground/70">{farmer.notes}</p>}
        </div>

        <div className="rounded-xl border border-earth-200 bg-white p-5">
          <h2 className="font-semibold text-foreground">{t("supplies")}</h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {farmer.suppliedProducts.map((sp: { productId: string; productName: string }) => (
              <span key={sp.productId} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                {sp.productName}
              </span>
            ))}
            {farmer.suppliedProducts.length === 0 && <p className="text-sm text-foreground/50">{t("noneListed")}</p>}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-earth-200 bg-white p-5">
        <h2 className="font-semibold text-foreground">{t("offerHistory")}</h2>
        <div className="mt-3 divide-y divide-earth-100">
          {offers.map((o) => {
            const req = requestById.get(String(o.purchaseRequestId));
            return (
              <div key={String(o._id)} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium">{req?.product.name ?? "—"}</p>
                  <p className="text-foreground/60">
                    {o.quantityAvailable} {req?.unit} @ {formatPrice(o.pricePerUnit)}/{req?.unit}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    o.status === "accepted"
                      ? "bg-brand-50 text-brand-700"
                      : o.status === "rejected"
                        ? "bg-red-50 text-red-600"
                        : "bg-earth-100 text-earth-600"
                  }`}
                >
                  {tProcurement(`offerStatus_${o.status}` as never)}
                </span>
              </div>
            );
          })}
          {offers.length === 0 && <p className="py-4 text-center text-sm text-foreground/50">{t("noOffersYet")}</p>}
        </div>
      </div>

      {isOwner && (
        <div className="mt-6 rounded-xl border border-earth-200 bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{t("ledger")}</h2>
            <div className="text-right text-sm">
              <p>{t("owed")} <span className="font-semibold">{formatPrice(totalOwed)}</span></p>
              <p>{t("paid")} <span className="font-semibold">{formatPrice(totalPaid)}</span></p>
              <p className="font-bold text-brand-800">{t("outstanding")} {formatPrice(totalOwed - totalPaid)}</p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-earth-100">
            {receipts.map((r) => {
              const outstanding = r.totalAmount - r.amountPaid;
              return (
                <div key={String(r._id)} className="py-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        {r.quantityReceived} {r.unit} @ {formatPrice(r.pricePerUnit)}/{r.unit}
                      </p>
                      <p className="text-foreground/60">
                        {new Date(r.receivedAt).toLocaleDateString()} · Total {formatPrice(r.totalAmount)} ·{" "}
                        {t(`paymentStatus_${r.paymentStatus}` as never)}
                        {r.amountPaid > 0 ? ` (${formatPrice(r.amountPaid)})` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {outstanding > 0 && <MarkPaymentButton receiptId={String(r._id)} outstanding={outstanding} />}
                      {!r.rating && <RateFarmerButton receiptId={String(r._id)} />}
                    </div>
                  </div>
                </div>
              );
            })}
            {receipts.length === 0 && (
              <p className="py-4 text-center text-sm text-foreground/50">{t("noReceipts")}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
