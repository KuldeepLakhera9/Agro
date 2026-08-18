import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { pick } from "@/lib/localizedField";
import { formatPrice } from "@/lib/format";
import { priceRange, totalStock, type PlainProduct } from "@/lib/queries/products";
import TrustBadge from "@/components/TrustBadge";

export default function ProductCard({ product }: { product: PlainProduct }) {
  const locale = useLocale();
  const t = useTranslations("Shop");
  const { min } = priceRange(product);
  const stock = totalStock(product);

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-brand-100 bg-white transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-brand-50">
        <Image
          src={product.images[0] ?? "/images/products/wheat-grain.svg"}
          alt={pick(product.name, locale)}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, 25vw"
        />
        {stock === 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-earth-800/90 px-2 py-1 text-xs font-semibold text-white">
            {t("outOfStock")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1">
          {product.badges.slice(0, 2).map((b) => (
            <TrustBadge key={b} badge={b} />
          ))}
        </div>
        <h3 className="font-semibold text-foreground">{pick(product.name, locale)}</h3>
        <p className="mt-auto text-sm font-medium text-brand-700">
          {t("fromPrice", { price: formatPrice(min) })}
        </p>
      </div>
    </Link>
  );
}
