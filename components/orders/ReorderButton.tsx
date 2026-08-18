"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";

interface ReorderItem {
  productId: string;
  sku: string;
  name: string;
  size: string;
  price: number;
  qty: number;
}

export default function ReorderButton({
  items,
  productSlugs,
}: {
  items: ReorderItem[];
  productSlugs: Record<string, string>;
}) {
  const t = useTranslations("Orders");
  const router = useRouter();
  const { addItem } = useCart();

  function handleReorder() {
    for (const item of items) {
      addItem(
        {
          productId: item.productId,
          sku: item.sku,
          slug: productSlugs[item.sku] ?? "",
          name: item.name,
          image: "",
          size: item.size,
          price: item.price,
          maxStock: item.qty,
        },
        item.qty,
      );
    }
    router.push("/cart");
  }

  return (
    <button
      onClick={handleReorder}
      className="rounded-full border-2 border-brand-600 px-5 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
    >
      {t("reorder")}
    </button>
  );
}
