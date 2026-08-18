"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import BrandLogo from "./BrandLogo";
import LanguageSwitcher from "./LanguageSwitcher";
import { useCart } from "@/lib/cart/CartContext";
import { SITE, telLink } from "@/lib/constants";

export default function Header() {
  const t = useTranslations("Nav");
  const common = useTranslations("Common");
  const pathname = usePathname();
  const { totalCount } = useCart();
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/", label: t("home") },
    { href: "/shop", label: t("shop") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <BrandLogo priority />

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-brand-700 ${
                pathname === l.href ? "text-brand-700" : "text-foreground/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={telLink(SITE.ownerPhone)}
            className="hidden rounded-full border border-brand-300 px-3 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 sm:inline-block"
          >
            {common("callNow")}
          </a>
          <LanguageSwitcher />
          <Link
            href="/cart"
            className="relative rounded-full p-2 text-brand-800 hover:bg-brand-50"
            aria-label={t("cart")}
          >
            <CartIcon />
            {totalCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-earth-500 px-1 text-xs font-bold text-white">
                {totalCount}
              </span>
            )}
          </Link>
          <button
            className="rounded-md p-2 text-brand-800 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-brand-100 px-4 py-3 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-foreground/80 hover:bg-brand-50"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={telLink(SITE.ownerPhone)}
            className="mt-1 rounded-md bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white"
          >
            {common("callNow")} — {SITE.ownerPhoneDisplay}
          </a>
        </nav>
      )}
    </header>
  );
}

function CartIcon() {
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
        d="M2.25 3h1.386c.51 0 .955.343 1.087.836l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 1.994-4.694 2.602-7.163.075-.312-.174-.6-.494-.6H5.106M7.5 14.25L5.106 5.25M7.5 14.25L6 20.25m10.5-6L19 20.25m-9.5-6L9 20.25"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      className="h-6 w-6"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
    </svg>
  );
}
