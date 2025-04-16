"use client";

import { Header } from "@/components/layout/Header";
import { PaymentPlans } from "@/components/payments/PaymentPlans";

export default function PricingPage() {
  return (
    <main className="flex-1">
      <PaymentPlans />
    </main>
  );
}
