import { NextResponse, type NextRequest } from "next/server";
import type { Address, Hex } from "viem";

import { listHires } from "@/lib/hire-store";
import { isSessionValid } from "@/lib/altana";
import { getAgent } from "@/lib/agents-repo";

function humanDuration(ms: number): string {
  if (ms <= 0) return "expired";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      return NextResponse.json(
        { error: { code: "INVALID_WALLET", message: "A valid Altana wallet address is required" } },
        { status: 400 },
      );
    }

    const records = await listHires(wallet);
    const hires = await Promise.all(records.map(async (h) => {
      const now = Date.now();
      const expired = new Date(h.expiryAt).getTime() <= now;
      let valid: boolean | null = null;
      if (h.altanaWalletAddress && h.sessionPublicKey) {
        try {
          valid = await isSessionValid({
            walletAddress: h.altanaWalletAddress as Address,
            sessionPublicKey: h.sessionPublicKey as Hex,
          });
        } catch {
          valid = null;
        }
      }
      const status: "active" | "revoked" | "expired" = expired
        ? "expired"
        : valid === false
          ? "revoked"
          : valid === true
            ? "active"
            : h.status;
      const agent = await getAgent(h.agentId);
      return {
        id: h.id,
        agentId: h.agentId,
        sessionKeyAddress: h.sessionKeyAddress,
        sessionPublicKey: h.sessionPublicKey,
        altanaWalletAddress: h.altanaWalletAddress,
        keystoreTxHash: h.keystoreTxHash,
        erc8183TxHash: h.erc8183TxHash,
        erc8183JobId: h.erc8183JobId,
        revokeTxHash: h.revokeTxHash,
        spendCap: h.spendCap,
        spent: h.spent,
        status,
        verification: valid === null && !expired ? "unavailable" : "verified",
        createdAt: h.createdAt.slice(0, 10),
        expiresIn:
          status === "revoked"
            ? "revoked"
            : humanDuration(new Date(h.expiryAt).getTime() - now),
        agent: agent ?? null,
      };
    }));

    return NextResponse.json({ hires }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Could not read the keystore. Please try again." } },
      { status: 500 },
    );
  }
}
