// ERC-8183 SDK wrapper (buyer side).
// TODO Phase 1: replace with the real hireErc8183Agent call from the Altana ERC-8183 SDK.
// This file is the ONLY place the ERC-8183 SDK may be touched (see CLAUDE.md conventions).
// The current implementation is a deterministic demo stub.

import { createHash } from "node:crypto";

const hex = (seed: string, length = 64) =>
  `0x${createHash("sha256").update(seed).digest("hex").slice(0, length)}`;

export function hireErc8183Agent(input: {
  agentAddress: string;
  sessionKeyAddress: string;
  spendCap: number;
}) {
  const txHash = hex(`erc8183:${input.agentAddress}:${input.sessionKeyAddress}`);
  const jobId = `job_${input.sessionKeyAddress.slice(2, 10)}_${Date.now().toString(36)}`;
  return { txHash, jobId };
}