"use client";

import { Header } from "@/components/layout/Header";
import { PaymentPlans } from "@/components/payments/PaymentPlans";

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <PaymentPlans />
      </main>
    </div>
  );
}
