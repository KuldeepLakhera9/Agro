import { Suspense } from "react";
import OfferFlow from "./OfferFlow";

export default function FarmerOfferPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-brand-800">लोड होत आहे...</p>}>
      <OfferFlow />
    </Suspense>
  );
}
