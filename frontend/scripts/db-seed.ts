// Creates the tables and seeds the demo agents + hires into Neon.
// Run with: npm run db:seed  (loads DATABASE_URL from .env.local)

import { agents, hires } from "../src/lib/agents.ts";
import { isDbConfigured, query } from "../src/lib/db.ts";

const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS agents (
  id TEXT PRIMARY KEY,
  agent_address TEXT NOT NULL,
  name TEXT NOT NULL,
  operator TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rebalancing', 'grid_trading', 'yield', 'health_factor')),
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  reputation NUMERIC NOT NULL,
  jobs INTEGER NOT NULL,
  volume_usd NUMERIC NOT NULL,
  success_rate NUMERIC NOT NULL,
  fee_bps INTEGER NOT NULL,
  median_runtime TEXT NOT NULL,
  allowlist JSONB NOT NULL,
  capabilities JSONB NOT NULL,
  activity JSONB NOT NULL,
  registered_at TIMESTAMPTZ NOT NULL,
  source_synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`,
  `CREATE TABLE IF NOT EXISTS hires (
  id TEXT PRIMARY KEY,
  user_wallet TEXT,
  agent_id TEXT REFERENCES agents (id),
  session_key_address TEXT NOT NULL,
  keystore_tx_hash TEXT NOT NULL,
  erc8183_tx_hash TEXT,
  spend_cap NUMERIC NOT NULL,
  spent NUMERIC NOT NULL DEFAULT 0,
  expiry_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)`,
  `CREATE INDEX IF NOT EXISTS hires_user_wallet_idx ON hires (user_wallet)`,
];

async function seed() {
  if (!isDbConfigured()) {
    console.error("DATABASE_URL is not set. Nothing to do.");
    process.exit(1);
  }

  for (const statement of DDL_STATEMENTS) {
    await query(statement);
  }

  for (const a of agents) {
    await query(
      `INSERT INTO agents
        (id, agent_address, name, operator, category, tagline, description, reputation, jobs,
         volume_usd, success_rate, fee_bps, median_runtime, allowlist, capabilities, activity, registered_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (id) DO UPDATE SET
         agent_address = EXCLUDED.agent_address,
         name = EXCLUDED.name,
         operator = EXCLUDED.operator,
         category = EXCLUDED.category,
         tagline = EXCLUDED.tagline,
         description = EXCLUDED.description,
         reputation = EXCLUDED.reputation,
         jobs = EXCLUDED.jobs,
         volume_usd = EXCLUDED.volume_usd,
         success_rate = EXCLUDED.success_rate,
         fee_bps = EXCLUDED.fee_bps,
         median_runtime = EXCLUDED.median_runtime,
         allowlist = EXCLUDED.allowlist,
         capabilities = EXCLUDED.capabilities,
         activity = EXCLUDED.activity,
         registered_at = EXCLUDED.registered_at`,
      [
        a.id,
        a.address,
        a.name,
        a.operator,
        a.category,
        a.tagline,
        a.description,
        a.reputation,
        a.jobs,
        a.volumeUsd,
        a.successRate,
        a.feeBps,
        a.medianRuntime,
        JSON.stringify(a.allowlist),
        JSON.stringify(a.capabilities),
        JSON.stringify(a.activity),
        `${a.registeredAt}T00:00:00.000Z`,
      ],
    );
  }

  const now = Date.now();
  for (const h of hires) {
    const expiryAt =
      h.status === "revoked"
        ? new Date(now - 7 * 86_400_000).toISOString()
        : new Date(now + 12 * 86_400_000).toISOString();
    await query(
      `INSERT INTO hires
        (id, user_wallet, agent_id, session_key_address, keystore_tx_hash, erc8183_tx_hash,
         spend_cap, spent, expiry_at, status, created_at)
       VALUES ($1, NULL, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         agent_id = EXCLUDED.agent_id,
         session_key_address = EXCLUDED.session_key_address,
         keystore_tx_hash = EXCLUDED.keystore_tx_hash,
         erc8183_tx_hash = EXCLUDED.erc8183_tx_hash,
         spend_cap = EXCLUDED.spend_cap,
         spent = EXCLUDED.spent,
         expiry_at = EXCLUDED.expiry_at,
         status = EXCLUDED.status`,
      [
        h.id,
        h.agentId,
        h.sessionKey,
        h.keystoreTx,
        h.hireTx,
        h.spendCap,
        h.spent,
        expiryAt,
        h.status,
        `${h.createdAt}T00:00:00.000Z`,
      ],
    );
  }

  console.log(`Seeded ${agents.length} agents and ${hires.length} demo hires.`);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});