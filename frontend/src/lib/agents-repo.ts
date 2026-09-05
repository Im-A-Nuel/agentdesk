import type { Agent } from "./agents";
import { agents as seedAgents } from "./agents";
import { isDbConfigured, query } from "./db";

type AgentRow = {
  id: string;
  agent_address: string;
  name: string;
  operator: string;
  category: Agent["category"];
  tagline: string;
  description: string;
  reputation: number;
  jobs: number;
  volume_usd: number;
  success_rate: number;
  fee_bps: number;
  median_runtime: string;
  allowlist: unknown;
  capabilities: unknown;
  activity: unknown;
  registered_at: string;
  source_synced_at: string;
};

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function rowToAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    operator: row.operator,
    address: row.agent_address,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    reputation: Number(row.reputation),
    jobs: Number(row.jobs),
    volumeUsd: Number(row.volume_usd),
    successRate: Number(row.success_rate),
    feeBps: Number(row.fee_bps),
    medianRuntime: row.median_runtime,
    allowlist: asArray(row.allowlist) as Agent["allowlist"],
    capabilities: asArray(row.capabilities) as string[],
    activity: asArray(row.activity) as { label: string; value: string }[],
    registeredAt: new Date(row.registered_at).toISOString().slice(0, 10),
  };
}

export async function listAgents(options?: {
  category?: string;
  search?: string;
}): Promise<Agent[]> {
  const category = options?.category && options.category !== "all" ? options.category : null;
  const search = options?.search?.trim().toLowerCase() || null;

  if (!isDbConfigured()) {
    return seedAgents.filter((a) => {
      const matchCategory = !category || a.category === category;
      const matchSearch =
        !search ||
        a.name.toLowerCase().includes(search) ||
        a.operator.toLowerCase().includes(search) ||
        a.tagline.toLowerCase().includes(search);
      return matchCategory && matchSearch;
    });
  }

  const rows = await query<AgentRow>(
    `SELECT * FROM agents
     WHERE ($1::text IS NULL OR category = $1)
       AND ($2::text IS NULL OR name ILIKE '%' || $2 || '%'
         OR operator ILIKE '%' || $2 || '%'
         OR tagline ILIKE '%' || $2 || '%')
     ORDER BY name`,
    [category, search],
  );
  return rows.map(rowToAgent);
}

export async function getAgent(id: string): Promise<Agent | undefined> {
  if (!isDbConfigured()) {
    return seedAgents.find((a) => a.id === id);
  }
  const rows = await query<AgentRow>("SELECT * FROM agents WHERE id = $1", [id]);
  return rows[0] ? rowToAgent(rows[0]) : undefined;
}