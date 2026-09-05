import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";

import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

import { Web3Providers } from "@/components/web3-providers";

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://agentdesk.vercel.app"),
  title: {
    default: "AgentDesk, Hire Onchain AI Agents on BNB Chain",
    template: "%s | AgentDesk",
  },
  description:
    "Discover verified ERC-8004 agents on BNB Smart Chain and hire them with a spend cap, a contract allowlist, and an expiry enforced onchain.",
  openGraph: {
    title: "AgentDesk, Hire Onchain AI Agents on BNB Chain",
    description:
      "A discovery to hire marketplace for AI agents, with scoped session keys registered in the Altana Keystore and instant onchain revoke.",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "AgentDesk: hire onchain AI agents on BNB Smart Chain, scoped, capped and revocable",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, "/favicon.ico"],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <Web3Providers>{children}</Web3Providers>
      </body>
    </html>
  );
}