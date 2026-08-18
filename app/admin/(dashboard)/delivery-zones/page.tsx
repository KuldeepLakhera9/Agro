import { connectDB } from "@/lib/db";
import DeliveryZone from "@/lib/models/DeliveryZone";
import DeliveryZoneManager from "@/components/admin/DeliveryZoneManager";

export default async function AdminDeliveryZonesPage() {
  await connectDB();
  const zones = await DeliveryZone.find().sort({ pincode: 1 }).lean();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">Delivery Zones</h1>
      <p className="mt-1 text-sm text-foreground/60">
        Only pincodes listed here are allowed to check out with home delivery.
      </p>
      <div className="mt-6">
        <DeliveryZoneManager zones={JSON.parse(JSON.stringify(zones))} />
      </div>
    </div>
  );
}
