import { z } from "zod";

const localizedString = z.object({ mr: z.string().min(1), hi: z.string().min(1), en: z.string().min(1) });

export const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: localizedString,
  category: z.enum(["oil", "grain"]),
  description: localizedString,
  badges: z.array(z.enum(["chemical_free", "cold_pressed", "grade_1"])),
  images: z.array(z.string()),
  variants: z
    .array(
      z.object({
        sku: z.string().min(1),
        size: z.string().min(1),
        unitLabel: z.string().min(1),
        price: z.number().min(0),
        stock: z.number().int().min(0),
      }),
    )
    .min(1),
  rawStock: z
    .object({
      quantity: z.number().min(0),
      unit: z.enum(["kg", "quintal"]),
      lowStockThreshold: z.number().min(0),
    })
    .optional(),
  isActive: z.boolean(),
});
