import { getAdminTranslations } from "@/lib/adminLocale";
import { requireOwnerPage } from "@/lib/auth/requirePageRole";
import { connectDB } from "@/lib/db";
import DeliveryZone from "@/lib/models/DeliveryZone";
import DeliveryZoneManager from "@/components/admin/DeliveryZoneManager";

export default async function AdminDeliveryZonesPage() {
  await requireOwnerPage();
  await connectDB();
  const [zones, t] = await Promise.all([
    DeliveryZone.find().sort({ pincode: 1 }).lean(),
    getAdminTranslations("Admin.Settings"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("deliveryZonesTitle")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("deliveryZonesSubtitle")}</p>
      <div className="mt-6">
        <DeliveryZoneManager zones={JSON.parse(JSON.stringify(zones))} />
      </div>
    </div>
  );
}
