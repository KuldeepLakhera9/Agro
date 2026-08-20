import { getAdminTranslations } from "@/lib/adminLocale";
import { requireOwnerPage } from "@/lib/auth/requirePageRole";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import UserRoleManager from "@/components/admin/UserRoleManager";

export default async function AdminUsersPage() {
  await requireOwnerPage();
  await connectDB();
  const [users, t] = await Promise.all([
    User.find({ role: { $in: ["staff", "owner"] } }).sort({ role: 1 }).lean(),
    getAdminTranslations("Admin.Settings"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("usersTitle")}</h1>
      <p className="mt-1 text-sm text-foreground/60">{t("usersSubtitle")}</p>
      <div className="mt-6">
        <UserRoleManager users={JSON.parse(JSON.stringify(users))} />
      </div>
    </div>
  );
}
