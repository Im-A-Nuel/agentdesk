import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAgent, listAgents } from "@/lib/agents-repo";
import { AgentDetail } from "./agent-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) {
    return { title: "Agent not found" };
  }
  return {
    title: agent.name,
    description: `${agent.tagline}. Review reputation, venues, fee, and the exact onchain permission before hiring.`,
    openGraph: {
      title: `${agent.name} on AgentDesk`,
      description: agent.tagline,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgent(id);
  if (!agent) notFound();
  const related = (await listAgents({ category: agent.category }))
    .filter((candidate) => candidate.id !== agent.id)
    .slice(0, 2);
  return <AgentDetail agent={agent} related={related} />;
}
