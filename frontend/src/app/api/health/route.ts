import { NextResponse } from "next/server";
import { isBscTestnetAvailable } from "@/lib/altana";
import { isDbConfigured, query } from "@/lib/db";

export async function GET() {
  const [chain, database] = await Promise.all([
    isBscTestnetAvailable(),
    isDbConfigured()
      ? query("SELECT 1").then(() => true).catch(() => false)
      : Promise.resolve(false),
  ]);
  const healthy = chain && database;
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: { bscTestnet: chain, database },
      checkedAt: new Date().toISOString(),
    },
    {
      status: healthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
