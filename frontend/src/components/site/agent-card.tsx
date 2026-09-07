import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryBadgeVariant, categoryLabel, shortAddress, type Agent } from "@/lib/agents";

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link
      href={`/agent/${agent.id}`}
      className="agent-card panel hairline-hover group relative flex h-full flex-col overflow-hidden p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-[17px] font-semibold">{agent.name}</h3>
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
        <Metric label="Score" value={`${agent.reputation}`} accent />
        <Metric label="Feedback" value={agent.jobs.toLocaleString("en-US")} />
        <Metric
          label="Validations"
          value={agent.activity.find((item) => item.label === "Validations")?.value ?? "0"}
        />
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <span className="num text-[11px] text-muted-foreground">
          ERC-8004 · BSC TESTNET
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
