import { Schema, model, models, type InferSchemaType } from "mongoose";
import { ROLES } from "@/lib/roles";

const AddressSchema = new Schema(
  {
    label: { type: String, default: "Home" },
    fullName: { type: String, required: true },
    line: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    state: { type: String, required: true, default: "Maharashtra" },
    phone: { type: String, required: true },
  },
  { timestamps: true },
);

const UserSchema = new Schema(
  {
    phone: { type: String, required: true, unique: true }, // E.164, e.g. +9198765xxxxx
    name: { type: String },
    addresses: { type: [AddressSchema], default: [] },
    role: { type: String, enum: ROLES, default: "customer", index: true },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export default models.User || model("User", UserSchema);
