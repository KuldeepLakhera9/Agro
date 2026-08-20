import { Schema, model, models, type InferSchemaType } from "mongoose";

const SuppliedProductSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
  },
  { _id: false },
);

const BankDetailsSchema = new Schema(
  {
    accountNumber: String,
    ifsc: String,
    accountHolder: String,
  },
  { _id: false },
);

const FarmerSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, // 10-digit, no +91 prefix
    village: String,
    taluka: String,
    district: String,
    suppliedProducts: { type: [SuppliedProductSchema], default: [] },
    preferredPaymentMode: { type: String, enum: ["cash", "upi", "bank_transfer"], default: "cash" },
    upiId: String,
    bankDetails: BankDetailsSchema,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },
    rating: { type: Number, default: null, min: 1, max: 5 },
    ratingCount: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true },
);

FarmerSchema.index({ "suppliedProducts.productId": 1 });

export type FarmerDoc = InferSchemaType<typeof FarmerSchema>;

export default models.Farmer || model("Farmer", FarmerSchema);
