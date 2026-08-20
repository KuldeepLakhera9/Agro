import { getAdminTranslations } from "@/lib/adminLocale";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import { formatPrice } from "@/lib/format";

export default async function AdminCustomersPage() {
  await connectDB();
  const [customers, t] = await Promise.all([
    User.find({ role: "customer" }).sort({ createdAt: -1 }).lean(),
    getAdminTranslations("Admin.Customers"),
  ]);

  const orderStats = await Order.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    { $group: { _id: "$userId", count: { $sum: 1 }, total: { $sum: "$total" } } },
  ]);
  const statsByUser = new Map(orderStats.map((s) => [String(s._id), s]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">{t("title")}</h1>

      <div className="mt-6 overflow-x-auto rounded-xl border border-earth-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-earth-200 text-left text-foreground/50">
            <tr>
              <th className="px-4 py-3">{t("colPhone")}</th>
              <th className="px-4 py-3">{t("colJoined")}</th>
              <th className="px-4 py-3">{t("colOrders")}</th>
              <th className="px-4 py-3 text-right">{t("colTotalSpend")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-earth-100">
            {customers.map((c) => {
              const stat = statsByUser.get(String(c._id));
              return (
                <tr key={String(c._id)} className="hover:bg-earth-50">
                  <td className="px-4 py-3 font-medium">{c.phone}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{stat?.count ?? 0}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatPrice(stat?.total ?? 0)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="px-4 py-8 text-center text-foreground/50">{t("noCustomers")}</p>
        )}
      </div>
    </div>
  );
}
