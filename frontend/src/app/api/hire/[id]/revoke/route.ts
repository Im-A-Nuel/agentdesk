import { NextResponse, type NextRequest } from "next/server";

import { revokeSession } from "@/lib/altana";
import { getHire, updateHire } from "@/lib/hire-store";

type Ctx = { params: Promise<{ id: string }> };

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  let body: { userWallet?: string } | null = null;
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

  const hire = getHire(id);
  if (!hire) return error(404, "NOT_FOUND", "Hire not found");
  if (hire.status === "revoked") {
    return error(400, "ALREADY_REVOKED", "Session is already revoked");
  }

  const userWallet = body?.userWallet;
  // Enforce ownership for real sessions. Demo seed rows (userWallet null) stay revocable
  // so the dashboard demo keeps working; real sessions belong to a specific wallet.
  if (hire.userWallet && (!userWallet || hire.userWallet.toLowerCase() !== userWallet.toLowerCase())) {
    return error(403, "NOT_OWNER", "You do not own this session");
  }

  try {
    const { txHash: revokeTxHash } = revokeSession(hire.sessionKeyAddress);
    updateHire(id, { status: "revoked" });
    return NextResponse.json({ revokeTxHash });
  } catch {
    return error(500, "INTERNAL", "Could not revoke the session. Please try again.");
  }
}