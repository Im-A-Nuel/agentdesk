import { NextResponse, type NextRequest } from "next/server";

import { listHires } from "@/lib/hire-store";
import { readSessionState } from "@/lib/altana";

function humanDuration(ms: number): string {
  if (ms <= 0) return "expired";
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
}

export function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");

    const hires = listHires(wallet).map((h) => {
      const live = readSessionState(h);
      const now = Date.now();
      const expired = new Date(live.expiresAt).getTime() <= now;
      const status: "active" | "revoked" | "expired" = live.isRevoked
        ? "revoked"
        : expired
          ? "expired"
          : "active";
      return {
        id: h.id,
        agentId: h.agentId,
        sessionKeyAddress: h.sessionKeyAddress,
        keystoreTxHash: h.keystoreTxHash,
        erc8183TxHash: h.erc8183TxHash,
        spendCap: h.spendCap,
        spent: live.spentAmount,
        status,
        createdAt: h.createdAt.slice(0, 10),
        expiresIn:
          status === "revoked"
            ? "revoked"
            : humanDuration(new Date(live.expiresAt).getTime() - now),
      };
    });

    return NextResponse.json({ hires });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Could not read the keystore. Please try again." } },
      { status: 500 },
    );
  }
}