import { Schema, model, models, type InferSchemaType } from "mongoose";

const OtpCodeSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

// TTL index — Mongo automatically deletes the doc once expiresAt passes
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpCodeDoc = InferSchemaType<typeof OtpCodeSchema>;

export default models.OtpCode || model("OtpCode", OtpCodeSchema);
