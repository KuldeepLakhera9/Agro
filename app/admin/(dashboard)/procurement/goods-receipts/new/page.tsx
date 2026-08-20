import { notFound } from "next/navigation";
import { getAdminTranslations } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import FarmerOffer from "@/lib/models/FarmerOffer";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import Farmer from "@/lib/models/Farmer";
import GoodsReceiptForm from "@/components/admin/GoodsReceiptForm";

export default async function NewGoodsReceiptPage({
  searchParams,
}: {
  searchParams: Promise<{ offerId?: string }>;
}) {
  const { offerId } = await searchParams;
  if (!offerId) notFound();

  await connectDB();
  const offer = await FarmerOffer.findById(offerId).lean();
  if (!offer || offer.status !== "accepted") notFound();

  const [purchaseRequest, farmer] = await Promise.all([
    PurchaseRequest.findById(offer.purchaseRequestId).lean(),
    Farmer.findById(offer.farmerId).lean(),
  ]);
  if (!purchaseRequest || !farmer) notFound();
  const t = await getAdminTranslations("Admin.Procurement");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("recordGoodsReceipt")}</h1>
      <div className="mt-6">
        <GoodsReceiptForm
          offerId={offerId}
          farmerName={farmer.name}
          productName={purchaseRequest.product.name}
          unit={purchaseRequest.unit}
          defaultQuantity={offer.quantityAvailable}
          defaultPrice={offer.pricePerUnit}
        />
      </div>
    </div>
  );
}
