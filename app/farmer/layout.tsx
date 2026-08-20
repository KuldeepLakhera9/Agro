import type { Metadata } from "next";
import { Noto_Sans_Devanagari } from "next/font/google";
import "../globals.css";

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari", "latin"],
});

export const metadata: Metadata = {
  title: "आईसाहेब ऍग्रो — शेतकरी",
};

export default function FarmerRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mr" className={`${notoDevanagari.variable} h-full antialiased`}>
      <body
        className="min-h-full bg-brand-50"
        style={{ fontFamily: "var(--font-noto-devanagari), Arial, sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
