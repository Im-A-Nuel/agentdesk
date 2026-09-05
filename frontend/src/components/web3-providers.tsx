"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, lightTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { Toaster } from "sonner";
import { useState, type ReactNode } from "react";

import { wagmiConfig } from "@/lib/web3";

const rainbowTheme = lightTheme({
  accentColor: "#7c3aed",
  accentColorForeground: "#ffffff",
  borderRadius: "large",
});

export function Web3Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <RainbowKitProvider theme={rainbowTheme} modalSize="compact">
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}