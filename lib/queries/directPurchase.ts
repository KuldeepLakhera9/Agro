import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import Farmer from "@/lib/models/Farmer";
import PurchaseRequest from "@/lib/models/PurchaseRequest";
import FarmerOffer from "@/lib/models/FarmerOffer";
import { createGoodsReceipt } from "@/lib/queries/goodsReceipts";

export interface CreateDirectPurchaseInput {
  farmerId: string;
  productId: string;
  quantity: number;
  unit: "kg" | "quintal";
  pricePerUnit: number;
  createdBy: string;
}

export type CreateDirectPurchaseResult =
  | { ok: true; receiptId: string }
  | {
      ok: false;
      error: "farmer_not_found" | "product_not_found" | "offer_not_found" | "offer_not_accepted";
    };

/**
 * For purchases agreed by phone call rather than through the digital
 * request/offer negotiation (lib/queries/orders.ts's PurchaseRequest →
 * FarmerOffer flow) — this is the same business event as accepting an
 * offer and receiving goods, just collapsed into one admin action. It
 * creates a fully-formed PurchaseRequest + accepted FarmerOffer behind the
 * scenes so every stock increase still traces back through the same
 * records the negotiated flow produces (consistent audit trail, reports,
 * and farmer offer history), then hands off to the same
 * createGoodsReceipt() used everywhere else — no separate atomic-stock
 * logic to maintain.
 */
export async function createDirectPurchase(
  input: CreateDirectPurchaseInput,
): Promise<CreateDirectPurchaseResult> {
  await connectDB();

  const [farmer, product] = await Promise.all([
    Farmer.findById(input.farmerId),
    Product.findById(input.productId),
  ]);
  if (!farmer) return { ok: false, error: "farmer_not_found" };
  if (!product) return { ok: false, error: "product_not_found" };

  const purchaseRequest = await PurchaseRequest.create({
    product: { productId: product._id, name: product.name.mr },
    quantityNeeded: input.quantity,
    unit: input.unit,
    sentTo: [farmer._id],
    status: "fulfilled",
    responses: [],
    createdBy: input.createdBy,
  });

  const offer = await FarmerOffer.create({
    purchaseRequestId: purchaseRequest._id,
    farmerId: farmer._id,
    quantityAvailable: input.quantity,
    pricePerUnit: input.pricePerUnit,
    status: "accepted",
  });

  purchaseRequest.responses.push({ farmerId: farmer._id, offerId: offer._id });
  await purchaseRequest.save();

  return createGoodsReceipt({
    farmerOfferId: String(offer._id),
    quantityReceived: input.quantity,
    pricePerUnit: input.pricePerUnit,
    recordedBy: input.createdBy,
  });
}
