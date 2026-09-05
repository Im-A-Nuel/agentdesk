// Altana SDK wrapper.
// TODO Phase 1: replace every function body below with the real Altana SDK call
// (createSession / registerToKeystore / revokeSession / readSessionState).
// This file is the ONLY place the Altana SDK may be touched (see CLAUDE.md conventions).
// The current implementation is a deterministic demo stub so the hire flow works end-to-end.

import { createHash } from "node:crypto";

export type CreateSessionInput = {
  owner: string;
  allowlist: string[];
  spendCap: number;
  expiresAt: string;
};

export type SessionState = {
  spentAmount: number;
  remainingCap: number;
  expiresAt: string;
  isRevoked: boolean;
};

const hex = (seed: string, length = 64) =>
  `0x${createHash("sha256").update(seed).digest("hex").slice(0, length)}`;

export function createSession({ owner, allowlist, spendCap, expiresAt }: CreateSessionInput) {
  const sessionKeyAddress = hex(`${owner}:${allowlist.join(",")}:${spendCap}:${expiresAt}`, 40);
  return { sessionKeyAddress };
}

export function registerToKeystore(sessionKeyAddress: string) {
  return { txHash: hex(`keystore:${sessionKeyAddress}`) };
}

export function revokeSession(sessionKeyAddress: string) {
  return { txHash: hex(`revoke:${sessionKeyAddress}`) };
}

export function readSessionState(record: {
  spent: number;
  spendCap: number;
  expiryAt: string;
  status: "active" | "revoked" | "expired";
}): SessionState {
  const now = Date.now();
  const expiresAt = new Date(record.expiryAt).getTime();
  const expired = now > expiresAt;
  const isRevoked = record.status === "revoked";
  const spentAmount = isRevoked || expired ? record.spent : record.spent;
  return {
    spentAmount,
    remainingCap: Math.max(0, record.spendCap - spentAmount),
    expiresAt: record.expiryAt,
    isRevoked,
  };
}