import { NextResponse, type NextRequest } from "next/server";

import { listAgents } from "@/lib/agents-repo";

export async function GET(req: NextRequest) {
  try {
    const agents = await listAgents({
      category: req.nextUrl.searchParams.get("category") ?? undefined,
      search: req.nextUrl.searchParams.get("search") ?? undefined,
    });
    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Could not load agents. Please try again." } },
      { status: 500 },
    );
  }
}