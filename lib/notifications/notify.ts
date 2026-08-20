import { renderTemplate } from "@/lib/notifications/renderTemplate";

/**
 * Swap point for real SMS/WhatsApp delivery (MSG91, WhatsApp Business API).
 * Every call site just calls notify() — replace the body here once the
 * client has a provider account, no other file needs to change.
 *
 * Farmer-directed events render in Marathi (the brief's default for all
 * farmer communication); admin-directed alerts render in English (the
 * admin dashboard is English-only).
 */
export type NotifyEvent =
  | { type: "order_confirmed"; phone: string; orderRef: string; total: number }
  | { type: "order_status_changed"; phone: string; orderRef: string; status: string }
  | {
      type: "purchase_request_sent";
      phone: string;
      productName: string;
      quantity: number;
      unit: string;
      targetPrice: number;
      neededBy: string;
      link: string;
    }
  | {
      type: "purchase_request_reminder";
      phone: string;
      productName: string;
      link: string;
    }
  | {
      type: "offer_accepted";
      phone: string;
      productName: string;
      quantity: number;
      unit: string;
      pricePerUnit: number;
      readyByDate: string;
    }
  | {
      type: "goods_receipt_confirmation";
      phone: string;
      productName: string;
      quantity: number;
      unit: string;
      pricePerUnit: number;
      totalAmount: number;
    }
  | {
      type: "payment_confirmation";
      phone: string;
      amount: number;
      paymentMode: string;
    }
  | {
      type: "low_stock_alert";
      productName: string;
      quantity: number;
      unit: string;
      threshold: number;
    }
  | {
      type: "new_offer_received";
      farmerName: string;
      productName: string;
      quantity: number;
      unit: string;
      pricePerUnit: number;
    };

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
    case "purchase_request_sent":
      console.log(
        `[notify] +91${event.phone}: ${renderTemplate("mr", "purchaseRequestSent", event)}`,
      );
      break;
    case "purchase_request_reminder":
      console.log(
        `[notify] +91${event.phone}: ${renderTemplate("mr", "purchaseRequestReminder", event)}`,
      );
      break;
    case "offer_accepted":
      console.log(
        `[notify] +91${event.phone}: ${renderTemplate("mr", "offerAccepted", event)}`,
      );
      break;
    case "goods_receipt_confirmation":
      console.log(
        `[notify] +91${event.phone}: ${renderTemplate("mr", "goodsReceiptConfirmation", event)}`,
      );
      break;
    case "payment_confirmation":
      console.log(
        `[notify] +91${event.phone}: ${renderTemplate("mr", "paymentConfirmation", event)}`,
      );
      break;
    case "low_stock_alert":
      console.log(`[notify][admin] ${renderTemplate("en", "lowStockAlert", event)}`);
      break;
    case "new_offer_received":
      console.log(`[notify][admin] ${renderTemplate("en", "newOfferReceived", event)}`);
      break;
  }
}
