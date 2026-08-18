import { getTranslations } from "next-intl/server";
import { getActiveProducts } from "@/lib/queries/products";
import ProductCard from "@/components/shop/ProductCard";
import ShopFilters from "@/components/shop/ShopFilters";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const t = await getTranslations("Shop");

  const products = await getActiveProducts({
    category: category === "oil" || category === "grain" ? category : undefined,
    search: q,
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      <div className="mt-6">
        <ShopFilters resultsCount={products.length} />
      </div>

      {products.length === 0 ? (
        <p className="mt-16 text-center text-foreground/60">{t("noResults")}</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
