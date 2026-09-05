import { NextResponse, type NextRequest } from "next/server";

import { agents } from "@/lib/agents";

export function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("search")?.trim().toLowerCase();

  let list = agents;
  if (category && category !== "all") {
    list = list.filter((a) => a.category === category);
  }
  if (search) {
    list = list.filter(
      (a) =>
        a.name.toLowerCase().includes(search) ||
        a.operator.toLowerCase().includes(search) ||
        a.tagline.toLowerCase().includes(search),
    );
  }

  return NextResponse.json({ agents: list });
}