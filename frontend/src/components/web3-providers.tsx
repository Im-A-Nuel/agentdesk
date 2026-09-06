"use client";

import { Toaster } from "sonner";
import type { ReactNode } from "react";

export function Web3Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </>
  );
}
