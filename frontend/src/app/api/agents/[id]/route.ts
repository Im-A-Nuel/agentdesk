import { NextResponse, type NextRequest } from "next/server";

import { getAgent } from "@/lib/agents";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const agent = getAgent(id);
  if (!agent) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Agent not found" } },
      { status: 404 },
    );
  }
  return NextResponse.json({ agent });
}