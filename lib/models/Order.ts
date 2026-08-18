import { Schema, model, models, type InferSchemaType } from "mongoose";
import { ORDER_STATUSES } from "@/lib/orderStatuses";

export { ORDER_STATUSES };

const OrderItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true }, // snapshot, in order's locale
    size: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false },
);

const StatusHistorySchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, required: true, default: Date.now },
    note: { type: String },
  },
  { _id: false },
);

const OrderAddressSchema = new Schema(
  {
    fullName: { type: String, required: true },
    line: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { _id: false },
);

const OrderSchema = new Schema(
  {
    orderRef: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    locale: { type: String, enum: ["mr", "hi", "en"], default: "mr" },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    deliveryMethod: { type: String, enum: ["home_delivery", "store_pickup"], required: true },
    address: { type: OrderAddressSchema },
    paymentMethod: { type: String, enum: ["cod"], required: true, default: "cod" },
    paymentStatus: { type: String, enum: ["pending", "paid"], default: "pending" },
    status: { type: String, enum: ORDER_STATUSES, required: true, default: "placed", index: true },
    statusHistory: { type: [StatusHistorySchema], required: true },
    driverName: { type: String },
  },
  { timestamps: true },
);

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof OrderSchema>;

export default models.Order || model("Order", OrderSchema);
