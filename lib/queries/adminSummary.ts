import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";

function startOfDay(daysAgo: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export interface RevenueStat {
  revenue: number;
  count: number;
}

export interface TopProduct {
  _id: string;
  qty: number;
  revenue: number;
}

export interface AdminSummary {
  today: RevenueStat;
  week: RevenueStat;
  month: RevenueStat;
  topProducts: TopProduct[];
}

export async function getAdminSummary(): Promise<AdminSummary> {
  await connectDB();

  const [today, week, month, topProducts] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay(0) }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay(7) }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay(30) }, status: { $ne: "cancelled" } } },
      { $group: { _id: null, revenue: { $sum: "$total" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay(30) }, status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const pick = (arr: RevenueStat[]) => arr[0] ?? { revenue: 0, count: 0 };

  return {
    today: pick(today),
    week: pick(week),
    month: pick(month),
    topProducts: JSON.parse(JSON.stringify(topProducts)),
  };
}
