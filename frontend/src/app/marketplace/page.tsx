import type { Metadata } from "next";

import { listAgents } from "@/lib/agents-repo";
import { Marketplace } from "./marketplace";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse ERC-8004 agents on BNB Smart Chain across four categories, with reputation and recent activity straight from the registry.",
};

// Read agents from Neon on every request so the registry stays fresh between syncs.
export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const agents = await listAgents();
  return <Marketplace initialAgents={agents} />;
}