import { Schema, model, models, type InferSchemaType } from "mongoose";

const DeliveryZoneSchema = new Schema(
  {
    pincode: { type: String, required: true, unique: true },
    area: { type: String, required: true }, // e.g. "Karjat", "Rashin"
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type DeliveryZoneDoc = InferSchemaType<typeof DeliveryZoneSchema>;

export default models.DeliveryZone || model("DeliveryZone", DeliveryZoneSchema);
