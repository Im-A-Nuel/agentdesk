import { fetchAgentsFrom8004scan } from "./agentscan.ts";
import { isDbConfigured, query } from "./db.ts";

export async function syncAgents() {
  if (!isDbConfigured()) throw new Error("DATABASE_URL is required to sync agents");
  const agents = await fetchAgentsFrom8004scan();
  if (agents.length === 0) throw new Error("8004scan returned no usable BSC testnet agents");
  for (const agent of agents) {
    await query(
      `INSERT INTO agents
        (id, agent_address, name, operator, category, tagline, description, reputation, jobs,
         volume_usd, success_rate, fee_bps, median_runtime, allowlist, capabilities, activity,
         registered_at, source_synced_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,now())
       ON CONFLICT (id) DO UPDATE SET
         agent_address=EXCLUDED.agent_address, name=EXCLUDED.name, operator=EXCLUDED.operator,
         category=EXCLUDED.category, tagline=EXCLUDED.tagline, description=EXCLUDED.description,
         reputation=EXCLUDED.reputation, jobs=EXCLUDED.jobs, volume_usd=EXCLUDED.volume_usd,
         success_rate=EXCLUDED.success_rate, fee_bps=EXCLUDED.fee_bps,
         median_runtime=EXCLUDED.median_runtime, allowlist=EXCLUDED.allowlist,
         capabilities=EXCLUDED.capabilities, activity=EXCLUDED.activity,
         registered_at=EXCLUDED.registered_at, source_synced_at=now()`,
      [agent.id, agent.address, agent.name, agent.operator, agent.category, agent.tagline,
        agent.description, agent.reputation, agent.jobs, agent.volumeUsd, agent.successRate,
        agent.feeBps, agent.medianRuntime, JSON.stringify(agent.allowlist),
        JSON.stringify(agent.capabilities), JSON.stringify(agent.activity),
        `${agent.registeredAt}T00:00:00.000Z`],
    );
  }
  return agents;
}
