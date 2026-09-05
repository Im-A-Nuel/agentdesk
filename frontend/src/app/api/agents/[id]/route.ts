import { NextResponse, type NextRequest } from "next/server";

import { getAgent } from "@/lib/agents-repo";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const agent = await getAgent(id);
    if (!agent) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Agent not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({ agent });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Could not load the agent. Please try again." } },
      { status: 500 },
    );
  }
}