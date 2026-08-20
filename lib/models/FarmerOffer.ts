import { Schema, model, models, type InferSchemaType } from "mongoose";

export const FARMER_OFFER_STATUSES = ["submitted", "accepted", "rejected", "expired"] as const;

const FarmerOfferSchema = new Schema(
  {
    purchaseRequestId: { type: Schema.Types.ObjectId, ref: "PurchaseRequest", required: true, index: true },
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true, index: true },
    quantityAvailable: { type: Number, required: true, min: 0 },
    pricePerUnit: { type: Number, required: true, min: 0 },
    readyByDate: { type: Date },
    status: { type: String, enum: FARMER_OFFER_STATUSES, default: "submitted", index: true },
  },
  { timestamps: true },
);

// One offer per farmer per request — resubmitting updates it rather than
// creating a duplicate row in the comparison table.
FarmerOfferSchema.index({ purchaseRequestId: 1, farmerId: 1 }, { unique: true });

export type FarmerOfferDoc = InferSchemaType<typeof FarmerOfferSchema>;

export default models.FarmerOffer || model("FarmerOffer", FarmerOfferSchema);
