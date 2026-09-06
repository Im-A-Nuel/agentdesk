import { ERC8183_ADDRESSES } from "@altananetwork/sdk";
import type { Address } from "viem";

import type { Agent, CategoryId } from "./agents.ts";

const API_BASE = "https://api.8004scan.io/api/v1";
const BSC_TESTNET_CHAIN_ID = 97;
const addressPattern = /^0x[a-fA-F0-9]{40}$/;

type ScanAgent = {
  id: string;
  agent_id: string;
  token_id: string;
  chain_id: number;
  owner_address: string;
  owner_ens?: string | null;
  owner_username?: string | null;
  name?: string | null;
  description?: string | null;
  agent_wallet?: string | null;
  is_verified?: boolean;
  is_active?: boolean;
  total_score?: number | null;
  total_feedbacks?: number | null;
  total_validations?: number | null;
  successful_validations?: number | null;
  supported_protocols?: string[] | null;
  categories?: string[] | null;
  tags?: string[] | null;
  created_at: string;
};

type ScanResponse = {
  items: ScanAgent[];
  total: number;
};

const searches: Record<CategoryId, string> = {
  rebalancing: "portfolio rebalancing",
  grid_trading: "grid trading",
  yield: "yield optimization",
  health_factor: "health factor liquidation monitoring",
};

function compactText(value: string | null | undefined): string {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function tagline(description: string): string {
  const firstSentence = description.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim();
  return (firstSentence || description).slice(0, 150);
}

function operator(agent: ScanAgent): string {
  return (
    compactText(agent.owner_username) ||
    compactText(agent.owner_ens) ||
    `${agent.owner_address.slice(0, 6)}...${agent.owner_address.slice(-4)}`
  );
}

function successRate(agent: ScanAgent): number {
  const total = Number(agent.total_validations ?? 0);
  if (total === 0) return 0;
  return Math.round((Number(agent.successful_validations ?? 0) / total) * 1000) / 10;
}

function allowlist() {
  const addresses = ERC8183_ADDRESSES[BSC_TESTNET_CHAIN_ID];
  if (!addresses) throw new Error("Altana does not expose ERC-8183 addresses for BSC testnet");
  return [
    { label: "ERC-8183 Commerce", address: addresses.commerce },
    { label: "ERC-8183 Evaluator Router", address: addresses.router },
    { label: "$U payment token", address: addresses.paymentToken, symbol: "$U" },
  ];
}

function toAgent(agent: ScanAgent, category: CategoryId): Agent | null {
  const wallet = agent.agent_wallet || agent.owner_address;
  const description = compactText(agent.description);
  const name = compactText(agent.name);
  if (
    agent.chain_id !== BSC_TESTNET_CHAIN_ID ||
    agent.is_active === false ||
    !addressPattern.test(wallet) ||
    !name ||
    !description
  ) {
    return null;
  }

  const capabilities = [
    ...(agent.categories ?? []),
    ...(agent.tags ?? []),
    ...(agent.supported_protocols ?? []),
  ]
    .map(compactText)
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .slice(0, 6);

  return {
    id: `erc8004-${agent.chain_id}-${agent.token_id}`,
    name,
    operator: operator(agent),
    address: wallet as Address,
    category,
    tagline: tagline(description),
    description,
    reputation: Math.round(Number(agent.total_score ?? 0) * 10) / 10,
    jobs: Number(agent.total_feedbacks ?? 0),
    volumeUsd: 0,
    successRate: successRate(agent),
    feeBps: 0,
    medianRuntime: "Not reported",
    allowlist: allowlist(),
    capabilities: capabilities.length > 0 ? capabilities : ["ERC-8004 registered agent"],
    activity: [
      { label: "Feedbacks", value: String(agent.total_feedbacks ?? 0) },
      { label: "Validations", value: String(agent.total_validations ?? 0) },
      { label: "Registry score", value: String(agent.total_score ?? 0) },
    ],
    registeredAt: new Date(agent.created_at).toISOString().slice(0, 10),
  };
}

async function search(category: CategoryId, limit: number): Promise<Agent[]> {
  const url = new URL(`${API_BASE}/agents/search/semantic`);
  url.searchParams.set("q", searches[category]);
  url.searchParams.set("chain_id", String(BSC_TESTNET_CHAIN_ID));
  url.searchParams.set("limit", String(limit));

  const headers = new Headers({ Accept: "application/json" });
  if (process.env.AGENTSCAN_API_KEY) {
    headers.set("X-API-Key", process.env.AGENTSCAN_API_KEY);
  }

  let response: Response | undefined;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(20_000) });
    if (response.ok || response.status < 500) break;
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  if (!response?.ok) throw new Error(`8004scan ${category} search failed with HTTP ${response?.status ?? "unknown"}`);
  const payload = (await response.json()) as ScanResponse;
  return payload.items.flatMap((item) => {
    const mapped = toAgent(item, category);
    return mapped ? [mapped] : [];
  });
}

export async function fetchAgentsFrom8004scan(perCategory = 6): Promise<Agent[]> {
  const results = await Promise.allSettled(
    (Object.keys(searches) as CategoryId[]).map((category) => search(category, perCategory)),
  );
  const batches = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  if (batches.length === 0) throw new Error("Every 8004scan category search failed");
  const unique = new Map<string, Agent>();
  for (const agent of batches.flat()) {
    if (!unique.has(agent.id)) unique.set(agent.id, agent);
  }
  return [...unique.values()];
}
