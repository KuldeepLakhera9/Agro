import { Schema, model, models, type InferSchemaType } from "mongoose";

const LocalizedStringSchema = new Schema(
  {
    mr: { type: String, required: true },
    hi: { type: String, required: true },
    en: { type: String, required: true },
  },
  { _id: false },
);

const VariantSchema = new Schema(
  {
    sku: { type: String, required: true, unique: true },
    size: { type: String, required: true }, // e.g. "500ml", "1L", "5kg"
    unitLabel: { type: String, required: true }, // e.g. "500 ml", "1 kg" for price-per-unit display
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: false },
);

// Raw material on hand for this product line (e.g. quintals of unpressed
// groundnut) — distinct from `variants[].stock`, which is packaged sellable
// units. Procurement (Goods Receipts) adds to this; converting it into
// packaged variant stock is a manual admin step, not modeled here.
const RawStockSchema = new Schema(
  {
    quantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, enum: ["kg", "quintal"], default: "kg" },
    lowStockThreshold: { type: Number, default: 0, min: 0 },
  },
  { _id: false },
);

const ProductSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    name: { type: LocalizedStringSchema, required: true },
    category: { type: String, enum: ["oil", "grain"], required: true, index: true },
    description: { type: LocalizedStringSchema, required: true },
    badges: {
      type: [String],
      enum: ["chemical_free", "cold_pressed", "grade_1"],
      default: [],
    },
    images: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    rawStock: { type: RawStockSchema, default: () => ({}) },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true },
);

ProductSchema.index({ isActive: 1, category: 1 });

export type ProductDoc = InferSchemaType<typeof ProductSchema>;

export default models.Product || model("Product", ProductSchema);
