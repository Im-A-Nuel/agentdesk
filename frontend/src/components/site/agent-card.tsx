import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryBadgeVariant, categoryLabel, shortAddress, usd, type Agent } from "@/lib/agents";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agent/${agent.id}`}
      className="glass-card hairline-hover group flex h-full flex-col p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[17px] font-semibold">{agent.name}</h3>
            <ShieldCheck className="h-3.5 w-3.5 text-brass opacity-70" />
          </div>
          <p className="num mt-1 text-[11px] text-muted-foreground">
            {shortAddress(agent.address)} · {agent.operator}
          </p>
        </div>
        <Badge variant={categoryBadgeVariant(agent.category)}>
          {categoryLabel(agent.category)}
        </Badge>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{agent.tagline}</p>

      <div className="panel-inset mt-5 grid grid-cols-3 divide-x divide-border">
        <Metric label="Reputation" value={`${agent.reputation}`} accent />
        <Metric label="Jobs" value={agent.jobs.toLocaleString("en-US")} />
        <Metric label="Volume" value={usd(agent.volumeUsd)} />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="num text-[11px] text-muted-foreground">
          FEE {agent.feeBps} BPS · {agent.successRate}% SUCCESS
        </span>
        <span className="flex items-center gap-1 text-xs font-medium text-brass transition-transform duration-300 ease-instrument group-hover:translate-x-0.5">
          Review terms
          <ArrowUpRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="px-3 py-3">
      <div className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">{label}</div>
      <div className={`num mt-1 text-base ${accent ? "text-brass" : "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}