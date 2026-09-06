// Hire store: Neon Postgres when DATABASE_URL is set, otherwise an empty in-memory store.
// Mirrors the `hires` table (see db/schema.sql). `status` stays cache-only: the dashboard
// still verifies the live keystore state per request (lib/altana.ts).

import { isDbConfigured, query } from "./db";

export type HireRecord = {
  id: string;
  userWallet: string | null;
  altanaWalletAddress: string | null;
  agentId: string;
  sessionKeyAddress: string;
  sessionPublicKey: string | null;
  keystoreTxHash: string | null;
  erc8183TxHash: string;
  erc8183JobId: string | null;
  revokeTxHash: string | null;
  spendCap: number;
  spent: number;
  expiryAt: string;
  status: "active" | "revoked" | "expired";
  createdAt: string;
};

type HireRow = {
  id: string;
  user_wallet: string | null;
  altana_wallet_address: string | null;
  agent_id: string;
  session_key_address: string;
  session_public_key: string | null;
  keystore_tx_hash: string | null;
  erc8183_tx_hash: string | null;
  erc8183_job_id: string | null;
  revoke_tx_hash: string | null;
  spend_cap: number;
  spent: number;
  expiry_at: string;
  status: HireRecord["status"];
  created_at: string;
};

function rowToRecord(row: HireRow): HireRecord {
  return {
    id: row.id,
    userWallet: row.user_wallet,
    altanaWalletAddress: row.altana_wallet_address,
    agentId: row.agent_id,
    sessionKeyAddress: row.session_key_address,
    sessionPublicKey: row.session_public_key,
    keystoreTxHash: row.keystore_tx_hash,
    erc8183TxHash: row.erc8183_tx_hash ?? "",
    erc8183JobId: row.erc8183_job_id,
    revokeTxHash: row.revoke_tx_hash,
    spendCap: Number(row.spend_cap),
    spent: Number(row.spent),
    expiryAt: new Date(row.expiry_at).toISOString(),
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

const memory = new Map<string, HireRecord>();

export async function listHires(wallet: string | null): Promise<HireRecord[]> {
  if (!isDbConfigured()) {
    const all = [...memory.values()];
    if (!wallet) return all;
    return all.filter((h) => h.userWallet?.toLowerCase() === wallet.toLowerCase());
  }
  const rows = await query<HireRow>(
    `SELECT * FROM hires
     WHERE $1::text IS NULL OR lower(user_wallet) = lower($1)
     ORDER BY created_at DESC`,
    [wallet],
  );
  return rows.map(rowToRecord);
}

export async function getHire(id: string): Promise<HireRecord | undefined> {
  if (!isDbConfigured()) return memory.get(id);
  const rows = await query<HireRow>("SELECT * FROM hires WHERE id = $1", [id]);
  return rows[0] ? rowToRecord(rows[0]) : undefined;
}

export async function createHire(
  input: Omit<HireRecord, "id" | "createdAt">,
): Promise<HireRecord> {
  const record: HireRecord = {
    ...input,
    id: `hire_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  if (!isDbConfigured()) {
    memory.set(record.id, record);
    return record;
  }
  const rows = await query<HireRow>(
    `INSERT INTO hires
      (id, user_wallet, altana_wallet_address, agent_id, session_key_address, session_public_key,
       keystore_tx_hash, erc8183_tx_hash, erc8183_job_id, revoke_tx_hash, spend_cap, spent,
       expiry_at, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      record.id,
      record.userWallet,
      record.altanaWalletAddress,
      record.agentId,
      record.sessionKeyAddress,
      record.sessionPublicKey,
      record.keystoreTxHash,
      record.erc8183TxHash,
      record.erc8183JobId,
      record.revokeTxHash,
      record.spendCap,
      record.spent,
      record.expiryAt,
      record.status,
      record.createdAt,
    ],
  );
  return rowToRecord(rows[0]!);
}

export async function updateHire(
  id: string,
  patch: Partial<Pick<HireRecord, "status" | "revokeTxHash">>,
): Promise<HireRecord | null> {
  if (!isDbConfigured()) {
    const record = memory.get(id);
    if (!record) return null;
    const next = { ...record, ...patch };
    memory.set(id, next);
    return next;
  }
  const rows = await query<HireRow>(
    `UPDATE hires
     SET status = COALESCE($2, status), revoke_tx_hash = COALESCE($3, revoke_tx_hash)
     WHERE id = $1 RETURNING *`,
    [id, patch.status ?? null, patch.revokeTxHash ?? null],
  );
  return rows[0] ? rowToRecord(rows[0]) : null;
}
