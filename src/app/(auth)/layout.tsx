import React from "react";

export default function AuthLayout({ children }: React.PropsWithChildren<{}>) {
  return (
    <main className="flex-1 container max-w-screen-xl mx-auto py-8 px-4 flex justify-center items-center">
      {children}
    </main>
  );
}
