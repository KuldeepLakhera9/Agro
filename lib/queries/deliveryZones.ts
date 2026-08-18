import { connectDB } from "@/lib/db";
import DeliveryZone from "@/lib/models/DeliveryZone";

export async function isPincodeServiceable(pincode: string) {
  await connectDB();
  const zone = await DeliveryZone.findOne({ pincode, isActive: true }).lean();
  return Boolean(zone);
}
