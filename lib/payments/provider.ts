/**
 * Swap point for a real payment gateway (Razorpay/Cashfree). Only COD is
 * wired today. Adding online payment later means: create a Razorpay order
 * here, verify its webhook/signature, then call the same order-creation
 * path used by COD (see app/api/orders/route.ts) with paymentStatus "paid".
 */
export type PaymentMethod = "cod";

export function isSupportedPaymentMethod(method: string): method is PaymentMethod {
  return method === "cod";
}
