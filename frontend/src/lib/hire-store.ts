// Hire store: Neon Postgres when DATABASE_URL is set, otherwise an in-memory demo store.
// Mirrors the `hires` table (see db/schema.sql). `status` stays cache-only: the dashboard
// still verifies the live keystore state per request (lib/altana.ts).

import { hires as seedHires } from "./agents";
import { isDbConfigured, query } from "./db";

export type HireRecord = {
  id: string;
  userWallet: string | null;
  agentId: string;
  sessionKeyAddress: string;
  keystoreTxHash: string;
  erc8183TxHash: string;
  spendCap: number;
  spent: number;
  expiryAt: string;
  status: "active" | "revoked" | "expired";
  createdAt: string;
};

type HireRow = {
  id: string;
  user_wallet: string | null;
  agent_id: string;
  session_key_address: string;
  keystore_tx_hash: string;
  erc8183_tx_hash: string | null;
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
    agentId: row.agent_id,
    sessionKeyAddress: row.session_key_address,
    keystoreTxHash: row.keystore_tx_hash,
    erc8183TxHash: row.erc8183_tx_hash ?? "",
    spendCap: Number(row.spend_cap),
    spent: Number(row.spent),
    expiryAt: new Date(row.expiry_at).toISOString(),
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

const memorySeed: HireRecord[] = seedHires.map((h) => ({
  id: h.id,
  userWallet: null,
  agentId: h.agentId,
  sessionKeyAddress: h.sessionKey,
  keystoreTxHash: h.keystoreTx,
  erc8183TxHash: h.hireTx,
  spendCap: h.spendCap,
  spent: h.spent,
  expiryAt:
    h.status === "revoked"
      ? new Date(Date.now() - 7 * 86_400_000).toISOString()
      : new Date(Date.now() + 12 * 86_400_000).toISOString(),
  status: h.status,
  createdAt: new Date(`${h.createdAt}T00:00:00.000Z`).toISOString(),
}));

const memory = new Map<string, HireRecord>(memorySeed.map((h) => [h.id, h]));

export async function listHires(wallet: string | null): Promise<HireRecord[]> {
  if (!isDbConfigured()) {
    const all = [...memory.values()];
    if (!wallet) return all;
    return all.filter(
      (h) => h.userWallet === null || h.userWallet.toLowerCase() === wallet.toLowerCase(),
    );
  }
  const rows = await query<HireRow>(
    `SELECT * FROM hires
     WHERE $1::text IS NULL OR user_wallet IS NULL OR lower(user_wallet) = lower($1)
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
      (id, user_wallet, agent_id, session_key_address, keystore_tx_hash, erc8183_tx_hash,
       spend_cap, spent, expiry_at, status, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      record.id,
      record.userWallet,
      record.agentId,
      record.sessionKeyAddress,
      record.keystoreTxHash,
      record.erc8183TxHash,
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
  patch: Partial<Pick<HireRecord, "status">>,
): Promise<HireRecord | null> {
  if (!isDbConfigured()) {
    const record = memory.get(id);
    if (!record) return null;
    const next = { ...record, ...patch };
    memory.set(id, next);
    return next;
  }
  const rows = await query<HireRow>("UPDATE hires SET status = $2 WHERE id = $1 RETURNING *", [
    id,
    patch.status,
  ]);
  return rows[0] ? rowToRecord(rows[0]) : null;
}