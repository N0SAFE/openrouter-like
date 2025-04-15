"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DocsSidebar } from "@/components/docs/DocsSidebar";
import { MdxRenderer } from "@/components/docs/MdxRenderer";

export default function DocsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const docPath = pathname.replace("/docs", "") || "/";
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <DocsSidebar />
        <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
          <div className="max-w-3xl mx-auto">
            <MdxRenderer docPath={docPath} />
          </div>
        </main>
      </div>
    </div>
  );
}
