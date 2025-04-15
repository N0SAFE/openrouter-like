"use client";

import { Header } from "@/components/layout/Header";
import { SignupForm } from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container max-w-screen-xl mx-auto py-8 px-4">
        <div className="max-w-md mx-auto">
          <SignupForm />
        </div>
      </main>
    </div>
  );
}
