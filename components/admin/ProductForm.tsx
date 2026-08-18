"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Variant {
  sku: string;
  size: string;
  unitLabel: string;
  price: number;
  stock: number;
}

interface ProductFormValue {
  slug: string;
  name: { mr: string; hi: string; en: string };
  category: "oil" | "grain";
  description: { mr: string; hi: string; en: string };
  badges: string[];
  images: string[];
  variants: Variant[];
  isActive: boolean;
}

const EMPTY: ProductFormValue = {
  slug: "",
  name: { mr: "", hi: "", en: "" },
  category: "oil",
  description: { mr: "", hi: "", en: "" },
  badges: [],
  images: [],
  variants: [{ sku: "", size: "", unitLabel: "", price: 0, stock: 0 }],
  isActive: true,
};

const BADGES = ["chemical_free", "cold_pressed", "grade_1"];

export default function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: ProductFormValue;
}) {
  const router = useRouter();
  const [value, setValue] = useState<ProductFormValue>(initial ?? EMPTY);
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join("\n"));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateVariant(index: number, patch: Partial<Variant>) {
    setValue((v) => ({
      ...v,
      variants: v.variants.map((variant, i) => (i === index ? { ...variant, ...patch } : variant)),
    }));
  }

  function addVariant() {
    setValue((v) => ({
      ...v,
      variants: [...v.variants, { sku: "", size: "", unitLabel: "", price: 0, stock: 0 }],
    }));
  }

  function removeVariant(index: number) {
    setValue((v) => ({ ...v, variants: v.variants.filter((_, i) => i !== index) }));
  }

  function toggleBadge(badge: string) {
    setValue((v) => ({
      ...v,
      badges: v.badges.includes(badge) ? v.badges.filter((b) => b !== badge) : [...v.badges, badge],
    }));
  }

  async function handleSubmit() {
    setBusy(true);
    setError(null);
    try {
      const payload = {
        ...value,
        images: imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch(
        productId ? `/api/admin/products/${productId}` : "/api/admin/products",
        {
          method: productId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-foreground/70">Slug</label>
        <input
          value={value.slug}
          onChange={(e) => setValue({ ...value, slug: e.target.value })}
          placeholder="groundnut-oil"
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/70">Category</label>
        <select
          value={value.category}
          onChange={(e) => setValue({ ...value, category: e.target.value as "oil" | "grain" })}
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        >
          <option value="oil">Oil</option>
          <option value="grain">Grain</option>
        </select>
      </div>

      <div>
        <p className="text-sm font-medium text-foreground/70">Name</p>
        {(["mr", "hi", "en"] as const).map((loc) => (
          <input
            key={loc}
            value={value.name[loc]}
            onChange={(e) => setValue({ ...value, name: { ...value.name, [loc]: e.target.value } })}
            placeholder={`Name (${loc})`}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-foreground/70">Description</p>
        {(["mr", "hi", "en"] as const).map((loc) => (
          <textarea
            key={loc}
            value={value.description[loc]}
            onChange={(e) =>
              setValue({ ...value, description: { ...value.description, [loc]: e.target.value } })
            }
            placeholder={`Description (${loc})`}
            rows={2}
            className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
          />
        ))}
      </div>

      <div>
        <p className="text-sm font-medium text-foreground/70">Badges</p>
        <div className="mt-1 flex gap-3">
          {BADGES.map((b) => (
            <label key={b} className="flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                checked={value.badges.includes(b)}
                onChange={() => toggleBadge(b)}
              />
              {b.replace(/_/g, " ")}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground/70">
          Image URLs (one per line)
        </label>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={2}
          placeholder="/images/products/groundnut-oil.svg"
          className="mt-1 w-full rounded-lg border border-earth-200 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-foreground/70">Variants (pack sizes)</p>
        <div className="mt-2 space-y-2">
          {value.variants.map((variant, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 rounded-lg border border-earth-200 p-2">
              <input
                value={variant.sku}
                onChange={(e) => updateVariant(i, { sku: e.target.value })}
                placeholder="SKU"
                className="col-span-2 rounded border border-earth-200 px-2 py-1 text-xs"
              />
              <input
                value={variant.size}
                onChange={(e) => updateVariant(i, { size: e.target.value })}
                placeholder="Size (1L)"
                className="rounded border border-earth-200 px-2 py-1 text-xs"
              />
              <input
                value={variant.unitLabel}
                onChange={(e) => updateVariant(i, { unitLabel: e.target.value })}
                placeholder="Unit label"
                className="rounded border border-earth-200 px-2 py-1 text-xs"
              />
              <input
                type="number"
                value={variant.price}
                onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                placeholder="Price"
                className="rounded border border-earth-200 px-2 py-1 text-xs"
              />
              <div className="flex gap-1">
                <input
                  type="number"
                  value={variant.stock}
                  onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                  placeholder="Stock"
                  className="w-full rounded border border-earth-200 px-2 py-1 text-xs"
                />
                <button
                  onClick={() => removeVariant(i)}
                  disabled={value.variants.length === 1}
                  className="px-1 text-red-600 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addVariant} className="mt-2 text-sm text-brand-600 hover:underline">
          + Add pack size
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium text-foreground/70">
        <input
          type="checkbox"
          checked={value.isActive}
          onChange={(e) => setValue({ ...value, isActive: e.target.checked })}
        />
        Active (visible in shop)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="rounded-full bg-brand-600 px-6 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Save Product"}
      </button>
    </div>
  );
}
