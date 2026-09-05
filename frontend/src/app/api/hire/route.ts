import { NextResponse, type NextRequest } from "next/server";

import { getAgent } from "@/lib/agents-repo";
import { createSession, registerToKeystore } from "@/lib/altana";
import { hireErc8183Agent } from "@/lib/erc8183";
import { createHire as saveHire } from "@/lib/hire-store";

const MAX_SPEND_CAP = 1_000_000;

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: NextRequest) {
  let body: {
    agentId?: string;
    spendCap?: number;
    durationSeconds?: number;
    userWallet?: string;
  } | null = null;
  try {
    body = await req.json();
  } catch {
    return error(400, "BAD_JSON", "Request body must be valid JSON");
  }

  const agentId = body?.agentId;
  const spendCap = Number(body?.spendCap);
  const durationSeconds = Number(body?.durationSeconds);
  const userWallet = body?.userWallet;

  const agent = agentId ? await getAgent(agentId) : undefined;
  if (!agent) return error(400, "INVALID_AGENT", "Unknown agent id");
  if (!userWallet || !/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
    return error(400, "INVALID_WALLET", "A valid wallet address is required");
  }
  if (!Number.isFinite(spendCap) || spendCap <= 0) {
    return error(400, "INVALID_CAP", "Spend cap must be greater than zero");
  }
  if (!Number.isFinite(spendCap) || spendCap > MAX_SPEND_CAP) {
    return error(400, "CAP_TOO_LARGE", `Spend cap cannot exceed $${MAX_SPEND_CAP.toLocaleString("en-US")}`);
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return error(400, "INVALID_DURATION", "Duration must be greater than zero");
  }

  try {
    const expiresAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
    const { sessionKeyAddress } = createSession({
      owner: userWallet,
      allowlist: agent.allowlist.map((c) => c.address),
      spendCap,
      expiresAt,
    });
    const { txHash: keystoreTxHash } = registerToKeystore(sessionKeyAddress);
    const { txHash: erc8183TxHash } = hireErc8183Agent({
      agentAddress: agent.address,
      sessionKeyAddress,
      spendCap,
    });

    const hire = await saveHire({
      userWallet,
      agentId: agent.id,
      sessionKeyAddress,
      keystoreTxHash,
      erc8183TxHash,
      spendCap,
      spent: 0,
      expiryAt: expiresAt,
      status: "active",
    });

    return NextResponse.json({ hire }, { status: 201 });
  } catch {
    return error(500, "INTERNAL", "Could not create the session. Please try again.");
  }
}