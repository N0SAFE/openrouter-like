"use client";

import { DocsSidebar } from "./DocsSidebar";

export function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <DocsSidebar />
      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10">
        {children}
      </div>
    </div>
  );
}
