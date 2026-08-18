import { useTranslations } from "next-intl";
import { SITE, telLink, whatsappLink } from "@/lib/constants";

export default function FloatingContact() {
  const t = useTranslations("Common");

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <a
        href={whatsappLink(SITE.ownerPhone)}
        aria-label={t("whatsappUs")}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      >
        <WhatsAppIcon />
      </a>
      <a
        href={telLink(SITE.ownerPhone)}
        aria-label={t("callNow")}
        className="flex h-13 w-13 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-black/20 transition-transform hover:scale-105"
      >
        <PhoneIcon />
      </a>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.994.523 3.856 1.437 5.474L2 22l4.72-1.535a9.87 9.87 0 004.32 1.002h.004c5.46 0 9.91-4.45 9.91-9.91 0-2.647-1.032-5.135-2.905-7.008A9.845 9.845 0 0012.04 2zm0 17.917h-.003a8.24 8.24 0 01-4.198-1.15l-.301-.179-3.13 1.018.996-3.05-.196-.313a8.222 8.222 0 01-1.264-4.395c0-4.545 3.7-8.245 8.25-8.245 2.203 0 4.274.86 5.833 2.42a8.19 8.19 0 012.415 5.83c-.001 4.545-3.702 8.245-8.402 8.245z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h1.5a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106a1.125 1.125 0 00-1.173.417l-.97 1.293a11.25 11.25 0 01-6.223-6.223l1.293-.97a1.125 1.125 0 00.417-1.173L8.963 3.852a1.125 1.125 0 00-1.091-.852H6.5A2.25 2.25 0 004.25 5.25v1.5z"
      />
    </svg>
  );
}
