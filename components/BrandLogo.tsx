import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface BrandLogoProps {
  variant?: "full" | "horizontal" | "compact" | "footer";
  className?: string;
  showTagline?: boolean;
  priority?: boolean;
}

export default function BrandLogo({
  variant = "horizontal",
  className = "",
  showTagline = true,
  priority = false,
}: BrandLogoProps) {
  if (variant === "compact") {
    return (
      <Link href="/" className={`inline-flex items-center gap-2.5 group ${className}`}>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-brand-200/80 bg-[#fcfaf2] p-0.5 shadow-xs transition-transform group-hover:scale-105">
          <Image
            src="/images/logo-icon.svg"
            alt="आईसाहेब ॲग्रो चिन्ह"
            width={40}
            height={40}
            priority={priority}
            className="h-full w-full object-contain"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-extrabold text-brand-900 tracking-tight font-heading">
            आईसाहेब <span className="text-earth-700">ॲग्रो</span>
          </span>
          {showTagline && (
            <span className="text-[10px] font-medium text-brand-700">
              शेतकरी ते ग्राहक थेट
            </span>
          )}
        </div>
      </Link>
    );
  }

  if (variant === "footer") {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 rounded-full border border-brand-600/40 bg-[#fcfaf2] p-1 shadow-md">
            <Image
              src="/images/logo-icon.svg"
              alt="आईसाहेब ॲग्रो"
              width={48}
              height={48}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-wider text-earth-300">॥ श्री दत्त प्रसन्न ॥</span>
            <span className="text-lg font-bold text-white tracking-tight">
              आईसाहेब <span className="text-earth-400">ॲग्रो इंडस्ट्रीज</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block rounded bg-brand-800 px-2 py-0.5 text-[11px] font-bold text-brand-100">
            शाखा नं. १
          </span>
          <span className="text-xs font-medium text-brand-200">
            धान्य व कोल्ड प्रेस ऑइल केंद्र
          </span>
        </div>
      </div>
    );
  }

  // Default / Horizontal Header Variant
  return (
    <Link href="/" className={`inline-flex items-center gap-3 group ${className}`}>
      <div className="relative h-11 w-11 shrink-0 rounded-full border border-brand-200/90 bg-[#fcfaf2] p-0.5 shadow-xs transition-transform group-hover:scale-105">
        <Image
          src="/images/logo-icon.svg"
          alt="आईसाहेब ॲग्रो लोगो"
          width={44}
          height={44}
          priority={priority}
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold text-earth-700 tracking-wider">॥ श्री दत्त प्रसन्न ॥</span>
          <span className="rounded bg-brand-100 px-1.5 py-0.2 text-[9px] font-bold text-brand-800">शाखा नं. १</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-black tracking-tight text-brand-900">
            आईसाहेब
          </span>
          <span className="text-base font-extrabold text-earth-700">
            ॲग्रो इंडस्ट्रीज
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-semibold text-brand-700">
            शेतकरी ते ग्राहक थेट सेवा • रशीन
          </span>
        )}
      </div>
    </Link>
  );
}
