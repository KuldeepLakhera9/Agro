import { Schema, model, models, type InferSchemaType } from "mongoose";

export const PURCHASE_REQUEST_STATUSES = [
  "draft",
  "sent",
  "partially_fulfilled",
  "fulfilled",
  "cancelled",
] as const;

const ResponseSchema = new Schema(
  {
    farmerId: { type: Schema.Types.ObjectId, ref: "Farmer", required: true },
    offerId: { type: Schema.Types.ObjectId, ref: "FarmerOffer", required: true },
  },
  { _id: false },
);

const PurchaseRequestSchema = new Schema(
  {
    product: {
      productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
      name: { type: String, required: true },
    },
    quantityNeeded: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["kg", "quintal"], required: true },
    targetPricePerUnit: { type: Number },
    neededBy: { type: Date },
    sentTo: { type: [Schema.Types.ObjectId], ref: "Farmer", default: [] },
    remindedAt: { type: Map, of: Date, default: {} }, // farmerId -> last reminder time
    status: { type: String, enum: PURCHASE_REQUEST_STATUSES, default: "draft", index: true },
    responses: { type: [ResponseSchema], default: [] },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export type PurchaseRequestDoc = InferSchemaType<typeof PurchaseRequestSchema>;

export default models.PurchaseRequest || model("PurchaseRequest", PurchaseRequestSchema);
