import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/products";
import { pick } from "@/lib/localizedField";
import ProductDetail from "@/components/shop/ProductDetail";
import ProductCard from "@/components/shop/ProductCard";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.slug);
  const t = await getTranslations("Product");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProductDetail product={product} locale={locale} />

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-bold text-brand-800">{t("relatedTitle")}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: pick(product.name, locale) };
}
