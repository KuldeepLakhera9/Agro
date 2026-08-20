import { Schema, model, models, type InferSchemaType } from "mongoose";

export const PAYMENT_STATUSES = ["pending", "paid", "partial"] as const;

const GoodsReceiptSchema = new Schema(
  {
    farmerOfferId: { type: Schema.Types.ObjectId, ref: "FarmerOffer", required: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    unit: { type: String, enum: ["kg", "quintal"], required: true },
    quantityReceived: { type: Number, required: true, min: 0 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending" },
    amountPaid: { type: Number, default: 0, min: 0 },
    receivedAt: { type: Date, required: true, default: Date.now },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Post-receipt rating of this specific delivery — feeds Farmer.rating's average
    rating: {
      onTime: { type: Boolean },
      qualityMatch: { type: Boolean },
      honestQuantity: { type: Boolean },
      score: { type: Number, min: 1, max: 5 },
    },
  },
  { timestamps: true },
);

GoodsReceiptSchema.index({ farmerId: 1, createdAt: -1 });

export type GoodsReceiptDoc = InferSchemaType<typeof GoodsReceiptSchema>;

export default models.GoodsReceipt || model("GoodsReceipt", GoodsReceiptSchema);
