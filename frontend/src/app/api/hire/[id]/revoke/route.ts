import { NextResponse, type NextRequest } from "next/server";

import { revokeSession } from "@/lib/altana";
import { getHire, updateHire } from "@/lib/hire-store";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const hire = getHire(id);
  if (!hire) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Hire not found" } },
      { status: 404 },
    );
  }
  if (hire.status === "revoked") {
    return NextResponse.json(
      { error: { code: "ALREADY_REVOKED", message: "Session is already revoked" } },
      { status: 400 },
    );
  }

  const { txHash: revokeTxHash } = revokeSession(hire.sessionKeyAddress);
  updateHire(id, { status: "revoked" });

  return NextResponse.json({ revokeTxHash });
}