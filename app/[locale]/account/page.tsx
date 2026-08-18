import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { Link } from "@/i18n/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();
  if (!session) redirect(`/${locale}`);

  const t = await getTranslations("Account");
  await connectDB();
  const user = await User.findById(session.userId).lean();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>
          <p className="mt-1 text-foreground/60">{session.phone}</p>
        </div>
        <LogoutButton />
      </div>

      <Link
        href="/orders"
        className="mt-8 flex items-center justify-between rounded-xl border border-brand-100 p-5 hover:bg-brand-50"
      >
        <span className="font-medium text-foreground">{t("myOrders")}</span>
        <span className="text-brand-600">→</span>
      </Link>

      <div className="mt-6 rounded-xl border border-brand-100 p-5">
        <h2 className="font-semibold text-foreground">{t("savedAddresses")}</h2>
        {!user?.addresses?.length ? (
          <p className="mt-2 text-sm text-foreground/60">—</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {user.addresses.map((a: { fullName: string; line: string; city: string; pincode: string }, i: number) => (
              <li key={i} className="text-sm text-foreground/70">
                {a.fullName} — {a.line}, {a.city}, {a.pincode}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
