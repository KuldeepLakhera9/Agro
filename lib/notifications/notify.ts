/**
 * Swap point for real SMS/WhatsApp delivery (MSG91, WhatsApp Business API).
 * Every call site just calls notify() — replace the body here once the
 * client has a provider account, no other file needs to change.
 */
export type NotifyEvent =
  | { type: "order_confirmed"; phone: string; orderRef: string; total: number }
  | { type: "order_status_changed"; phone: string; orderRef: string; status: string };

export async function notify(event: NotifyEvent) {
  switch (event.type) {
    case "order_confirmed":
      console.log(
        `[notify] +91${event.phone}: Your Aisaheb Agro order ${event.orderRef} for ₹${event.total} is confirmed.`,
      );
      break;
    case "order_status_changed":
      console.log(
        `[notify] +91${event.phone}: Your order ${event.orderRef} is now "${event.status}".`,
      );
      break;
  }
}
