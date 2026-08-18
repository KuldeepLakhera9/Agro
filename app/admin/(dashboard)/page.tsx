import { getAdminSummary } from "@/lib/queries/adminSummary";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboardPage() {
  const summary = await getAdminSummary();

  const cards = [
    { label: "Today", stat: summary.today },
    { label: "Last 7 Days", stat: summary.week },
    { label: "Last 30 Days", stat: summary.month },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-800">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-earth-200 bg-white p-5">
            <p className="text-sm font-medium text-foreground/60">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-brand-800">
              {formatPrice(c.stat.revenue)}
            </p>
            <p className="text-sm text-foreground/50">{c.stat.count} orders</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-earth-200 bg-white p-5">
        <h2 className="font-semibold text-foreground">Top Products (30 days)</h2>
        {summary.topProducts.length === 0 ? (
          <p className="mt-3 text-sm text-foreground/50">No sales yet.</p>
        ) : (
          <div className="mt-3 divide-y divide-earth-100">
            {summary.topProducts.map((p) => (
              <div key={p._id} className="flex justify-between py-2 text-sm">
                <span className="text-foreground/80">
                  {p._id} × {p.qty}
                </span>
                <span className="font-semibold text-brand-700">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
