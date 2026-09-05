// Demo in-memory hire store.
// Mirrors the `hires` table in SCHEMA.md (Supabase).
// TODO Phase 2: replace with Supabase persistence via lib/supabase.ts.
// Data lives in module scope, so it resets on server restart. Seed rows are marked
// with userWallet: null and stay visible to any wallet so the demo dashboard has content.

import { hires as seedHires } from "./agents";

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

const seed: HireRecord[] = seedHires.map((h) => ({
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

const records = new Map<string, HireRecord>(seed.map((h) => [h.id, h]));

export function listHires(wallet: string | null): HireRecord[] {
  const all = [...records.values()];
  if (!wallet) return all;
  return all.filter(
    (h) => h.userWallet === null || h.userWallet.toLowerCase() === wallet.toLowerCase(),
  );
}

export function getHire(id: string): HireRecord | undefined {
  return records.get(id);
}

export function createHire(input: Omit<HireRecord, "id" | "createdAt">): HireRecord {
  const record: HireRecord = {
    ...input,
    id: `hire_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  records.set(record.id, record);
  return record;
}

export function updateHire(
  id: string,
  patch: Partial<Pick<HireRecord, "status">>,
): HireRecord | null {
  const record = records.get(id);
  if (!record) return null;
  const next = { ...record, ...patch };
  records.set(id, next);
  return next;
}