import { useTranslations } from "next-intl";
import { ORDER_STATUSES } from "@/lib/orderStatuses";

const ACTIVE_FLOW = ORDER_STATUSES.filter((s) => s !== "cancelled");

export default function StatusTimeline({
  status,
  statusHistory,
}: {
  status: string;
  statusHistory: { status: string; at: string }[];
}) {
  const t = useTranslations("Orders");

  if (status === "cancelled") {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        {t("status_cancelled")}
      </div>
    );
  }

  const currentIndex = ACTIVE_FLOW.indexOf(status as (typeof ACTIVE_FLOW)[number]);
  const historyByStatus = new Map(statusHistory.map((h) => [h.status, h.at]));

  return (
    <ol className="flex flex-col gap-0">
      {ACTIVE_FLOW.map((s, i) => {
        const done = i <= currentIndex;
        const at = historyByStatus.get(s);
        return (
          <li key={s} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done ? "bg-brand-600 text-white" : "bg-brand-100 text-brand-400"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              {i < ACTIVE_FLOW.length - 1 && (
                <span
                  className={`w-0.5 flex-1 ${i < currentIndex ? "bg-brand-600" : "bg-brand-100"}`}
                  style={{ minHeight: "2rem" }}
                />
              )}
            </div>
            <div className="pb-8">
              <p className={`font-medium ${done ? "text-foreground" : "text-foreground/40"}`}>
                {t(`status_${s}` as never)}
              </p>
              {at && (
                <p className="text-xs text-foreground/50">
                  {new Date(at).toLocaleString()}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
