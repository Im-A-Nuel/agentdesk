import { NextResponse, type NextRequest } from "next/server";
import { BNB_TESTNET } from "@altananetwork/sdk";
import type { Address, Hex } from "viem";

import { isSessionValid, isSuccessfulTransaction } from "@/lib/altana";
import { getHire, updateHire } from "@/lib/hire-store";

type Ctx = { params: Promise<{ id: string }> };

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  let body: { userWallet?: string; revokeTxHash?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    return error(400, "BAD_JSON", "Request body must be valid JSON");
  }

  let id: string;
  try {
    ({ id } = await params);
  } catch {
    return error(400, "INVALID_ID", "Invalid session id");
  }

  const hire = await getHire(id);
  if (!hire) return error(404, "NOT_FOUND", "Hire not found");
  if (hire.status === "revoked") {
    return error(400, "ALREADY_REVOKED", "Session is already revoked");
  }

  const userWallet = body?.userWallet;
  if (hire.userWallet && (!userWallet || hire.userWallet.toLowerCase() !== userWallet.toLowerCase())) {
    return error(403, "NOT_OWNER", "You do not own this session");
  }
  const revokeTxHash = body?.revokeTxHash;
  if (!revokeTxHash || !/^0x[a-fA-F0-9]{64}$/.test(revokeTxHash)) {
    return error(400, "INVALID_REVOKE_TX", "A valid revoke transaction hash is required");
  }
  if (!hire.altanaWalletAddress || !hire.sessionPublicKey) {
    return error(409, "LEGACY_HIRE", "This legacy demo session has no onchain proof");
  }

  try {
    const [txValid, sessionValid] = await Promise.all([
      isSuccessfulTransaction(revokeTxHash as Hex, BNB_TESTNET.keyStore),
      isSessionValid({
        walletAddress: hire.altanaWalletAddress as Address,
        sessionPublicKey: hire.sessionPublicKey as Hex,
      }),
    ]);
    if (!txValid || sessionValid) {
      return error(422, "REVOKE_NOT_CONFIRMED", "Revocation is not confirmed in Keystore");
    }
    await updateHire(id, { status: "revoked", revokeTxHash });
    return NextResponse.json({ revokeTxHash });
  } catch {
    return error(500, "INTERNAL", "Could not revoke the session. Please try again.");
  }
}
