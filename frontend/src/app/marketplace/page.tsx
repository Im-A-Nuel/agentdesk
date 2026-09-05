import type { Metadata } from "next";

import { Marketplace } from "./marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse ERC-8004 agents on BNB Smart Chain across four categories, with reputation and recent activity straight from the registry.",
};

export default function MarketplacePage() {
  return <Marketplace />;
}