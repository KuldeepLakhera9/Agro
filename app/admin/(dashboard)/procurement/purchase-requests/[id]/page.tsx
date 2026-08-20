import { notFound } from "next/navigation";
import { getAdminTranslations } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import FarmerOffer from "@/lib/models/FarmerOffer";
import Farmer from "@/lib/models/Farmer";
import { formatPrice } from "@/lib/format";
import PurchaseRequestActions from "@/components/admin/PurchaseRequestActions";

export default async function PurchaseRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const pr = await PurchaseRequest.findById(id).lean();
  if (!pr) notFound();
  const t = await getAdminTranslations("Admin.Procurement");

  const [offers, sentToFarmers] = await Promise.all([
    FarmerOffer.find({ purchaseRequestId: id }).lean(),
    Farmer.find({ _id: { $in: pr.sentTo } }).lean(),
  ]);
  const farmerById = new Map(sentToFarmers.map((f) => [String(f._id), f]));
  const offersWithFarmer = offers.map((o) => ({
    ...o,
    _id: String(o._id),
    farmerId: String(o.farmerId),
    readyByDate: o.readyByDate ? o.readyByDate.toISOString() : undefined,
    farmer: farmerById.get(String(o.farmerId))
      ? {
          _id: String(o.farmerId),
          name: farmerById.get(String(o.farmerId))!.name,
          village: farmerById.get(String(o.farmerId))!.village,
          rating: farmerById.get(String(o.farmerId))!.rating,
        }
      : undefined,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{pr.product.name}</h1>
      <div className="mt-2 flex flex-wrap gap-4 text-sm text-foreground/70">
        <span>{t("neededLine", { quantity: pr.quantityNeeded, unit: pr.unit })}</span>
        {pr.targetPricePerUnit && (
          <span>{t("targetPriceLine", { price: formatPrice(pr.targetPricePerUnit), unit: pr.unit })}</span>
        )}
        {pr.neededBy && (
          <span>{t("neededByLine", { date: new Date(pr.neededBy).toLocaleDateString() })}</span>
        )}
        <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
          {t(`status_${pr.status}` as never)}
        </span>
      </div>

      <div className="mt-6">
        <PurchaseRequestActions
          requestId={id}
          status={pr.status}
          unit={pr.unit}
          sentToFarmers={JSON.parse(JSON.stringify(sentToFarmers)).map((f: { _id: string; name: string; village?: string; rating?: number | null }) => ({
            _id: f._id,
            name: f.name,
            village: f.village,
            rating: f.rating,
          }))}
          offers={JSON.parse(JSON.stringify(offersWithFarmer))}
        />
      </div>
    </div>
  );
}
