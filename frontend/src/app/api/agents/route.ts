import { NextResponse, type NextRequest } from "next/server";

import { listAgents } from "@/lib/agents-repo";
import { categories } from "@/lib/agents";

export async function GET(req: NextRequest) {
  try {
    const category = req.nextUrl.searchParams.get("category") ?? undefined;
    const search = req.nextUrl.searchParams.get("search")?.trim() ?? undefined;
    if (category && !categories.some((item) => item.id === category)) {
      return NextResponse.json(
        { error: { code: "INVALID_CATEGORY", message: "Unknown agent category" } },
        { status: 400 },
      );
    }
    if (search && search.length > 100) {
      return NextResponse.json(
        { error: { code: "INVALID_SEARCH", message: "Search must be 100 characters or fewer" } },
        { status: 400 },
      );
    }
    const agents = await listAgents({
      category,
      search,
    });
    return NextResponse.json(
      { agents },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Could not load agents. Please try again." } },
      { status: 500 },
    );
  }
}
