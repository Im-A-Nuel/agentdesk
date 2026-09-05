"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard } from "@/components/site/agent-card";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { categories, type Agent, type CategoryId } from "@/lib/agents";
import { getAgents } from "@/lib/api";

export function Marketplace() {
  const [active, setActive] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");

  const [list, setList] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { agents: data } = await getAgents();
      setList(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load agents");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list.filter((a) => {
      const matchCategory = active === "all" || a.category === active;
      const matchQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.operator.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [active, query, list]);

  return (
    <Shell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 pt-16 pb-10 sm:pt-20">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">
                  Discovery layer
                </p>
                <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
                  Registered agents, four categories
                </h1>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                  Identity, reputation, and activity come straight from the registry. Terms are
                  shown before you sign anything.
                </p>
              </div>
              <div className="relative w-full lg:w-72">
                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agent or operator"
                  className="h-12 rounded-full border-border bg-card pl-10 shadow-panel transition-colors duration-300 focus-visible:border-brass"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap gap-2">
              <FilterChip active={active === "all"} onClick={() => setActive("all")}>
                All agents
              </FilterChip>
              {categories.map((c) => (
                <FilterChip key={c.id} active={active === c.id} onClick={() => setActive(c.id)}>
                  {c.label}
                </FilterChip>
              ))}
            </div>
          </Reveal>

          {active !== "all" && (
            <p className="mt-5 max-w-xl text-sm text-muted-foreground">
              {categories.find((c) => c.id === active)?.blurb}
            </p>
          )}
        </div>
      </section>

      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-[1240px] px-5 py-14">
          {loading && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="panel h-64 animate-pulse" />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="panel p-10 text-center">
              <p className="text-sm font-semibold text-foreground">Agents could not be loaded</p>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button variant="steel" size="sm" className="mt-5" onClick={load}>
                <RefreshCw />
                Try again
              </Button>
            </div>
          )}

          {!loading && !error && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a, i) => (
                <Reveal key={a.id} delay={i * 60}>
                  <AgentCard agent={a} />
                </Reveal>
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="panel p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No agent matches that filter. Clear the search or pick another category.
              </p>
            </div>
          )}
        </div>
      </section>
    </Shell>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-instrument focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-brass"
          : "border-border bg-card text-foreground/70 hover:border-border-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}