-- AgentDesk Postgres schema (Neon). Apply with `npm run db:migrate`.

CREATE TABLE IF NOT EXISTS agents (
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
);

CREATE TABLE IF NOT EXISTS hires (
  id TEXT PRIMARY KEY,
  user_wallet TEXT,
  altana_wallet_address TEXT,
  agent_id TEXT REFERENCES agents (id),
  session_key_address TEXT NOT NULL,
  session_public_key TEXT,
  keystore_tx_hash TEXT,
  erc8183_tx_hash TEXT,
  erc8183_job_id TEXT,
  revoke_tx_hash TEXT,
  spend_cap NUMERIC NOT NULL,
  spent NUMERIC NOT NULL DEFAULT 0,
  expiry_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'revoked', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hires_user_wallet_idx ON hires (user_wallet);
CREATE INDEX IF NOT EXISTS hires_altana_wallet_idx ON hires (altana_wallet_address);
CREATE UNIQUE INDEX IF NOT EXISTS hires_erc8183_job_idx ON hires (erc8183_job_id) WHERE erc8183_job_id IS NOT NULL;
