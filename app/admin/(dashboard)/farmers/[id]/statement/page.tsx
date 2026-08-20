import { notFound } from "next/navigation";
import { getAdminTranslations } from "@/lib/adminLocale";
import { requireOwnerPage } from "@/lib/auth/requirePageRole";
import { connectDB } from "@/lib/db";
import Farmer from "@/lib/models/Farmer";
import GoodsReceipt from "@/lib/models/GoodsReceipt";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/constants";
import PrintButton from "@/components/admin/PrintButton";

export default async function FarmerStatementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwnerPage();
  const { id } = await params;
  await connectDB();

  const farmer = await Farmer.findById(id).lean();
  if (!farmer) notFound();
  const t = await getAdminTranslations("Admin.Farmers");

  const receipts = await GoodsReceipt.find({ farmerId: id }).sort({ receivedAt: 1 }).lean();
  const totalOwed = receipts.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalPaid = receipts.reduce((sum, r) => sum + r.amountPaid, 0);

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 print:p-0">
      <div className="flex items-center justify-between border-b border-earth-200 pb-4">
        <div>
          <p className="text-lg font-bold text-brand-800">{SITE.ownerName}</p>
          <p className="text-sm text-foreground/60">{SITE.addressLine}</p>
        </div>
        <p className="text-sm text-foreground/60">
          {t("statementDate", { date: new Date().toLocaleDateString() })}
        </p>
      </div>

      <div className="mt-4">
        <p className="font-semibold text-foreground">{t("farmerLabel", { name: farmer.name })}</p>
        <p className="text-sm text-foreground/60">
          {farmer.phone} · {farmer.village}, {farmer.taluka}
        </p>
      </div>

      <table className="mt-6 w-full text-sm">
        <thead className="border-b border-earth-300 text-left">
          <tr>
            <th className="py-2">{t("colDate")}</th>
            <th className="py-2">{t("colQtyShort")}</th>
            <th className="py-2">{t("colRate")}</th>
            <th className="py-2 text-right">{t("colAmount")}</th>
            <th className="py-2 text-right">{t("colPaid")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-earth-100">
          {receipts.map((r) => (
            <tr key={String(r._id)}>
              <td className="py-2">{new Date(r.receivedAt).toLocaleDateString()}</td>
              <td className="py-2">{r.quantityReceived} {r.unit}</td>
              <td className="py-2">{formatPrice(r.pricePerUnit)}</td>
              <td className="py-2 text-right">{formatPrice(r.totalAmount)}</td>
              <td className="py-2 text-right">{formatPrice(r.amountPaid)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-1 text-sm">
          <div className="flex justify-between"><span>{t("totalOwed")}</span><span>{formatPrice(totalOwed)}</span></div>
          <div className="flex justify-between"><span>{t("totalPaid")}</span><span>{formatPrice(totalPaid)}</span></div>
          <div className="flex justify-between border-t border-earth-300 pt-1 font-bold">
            <span>{t("outstanding").replace(":", "")}</span><span>{formatPrice(totalOwed - totalPaid)}</span>
          </div>
        </div>
      </div>

      <PrintButton />
    </div>
  );
}
