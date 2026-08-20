import { NextResponse } from "next/server";
import { getFarmerSession } from "@/lib/auth/farmerSession";

export async function GET() {
  const session = await getFarmerSession();
  return NextResponse.json({ session });
}
