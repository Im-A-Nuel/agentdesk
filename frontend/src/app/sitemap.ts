import type { MetadataRoute } from "next";
import { listAgents } from "@/lib/agents-repo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) return [];

  const now = new Date();
  let agentEntries: MetadataRoute.Sitemap = [];
  try {
    const agents = await listAgents({ limit: 100 });
    agentEntries = agents.map((agent) => ({
      url: `${siteUrl}/agent/${agent.id}`,
      lastModified: agent.sourceSyncedAt ? new Date(agent.sourceSyncedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    agentEntries = [];
  }
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/marketplace`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...agentEntries,
  ];
}
