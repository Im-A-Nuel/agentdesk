"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentCard } from "@/components/site/agent-card";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { categories, type Agent, type CategoryId } from "@/lib/agents";

export function Marketplace({ initialAgents }: { initialAgents: Agent[] }) {
  const [active, setActive] = useState<CategoryId | "all">("all");
  const [query, setQuery] = useState("");
  const [filtersReady, setFiltersReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const search = params.get("q");
    if (category && categories.some((item) => item.id === category)) {
      setActive(category as CategoryId);
    }
    if (search) setQuery(search.slice(0, 100));
    setFiltersReady(true);
  }, []);

  useEffect(() => {
    if (!filtersReady) return;
    const params = new URLSearchParams();
    if (active !== "all") params.set("category", active);
    if (query.trim()) params.set("q", query.trim());
    const suffix = params.toString();
    window.history.replaceState(null, "", suffix ? `/marketplace?${suffix}` : "/marketplace");
  }, [active, filtersReady, query]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return initialAgents.filter((a) => {
      const matchCategory = active === "all" || a.category === active;
      const matchQuery =
        !q ||
        a.name.toLowerCase().includes(q) ||
        a.operator.toLowerCase().includes(q) ||
        a.tagline.toLowerCase().includes(q);
      return matchCategory && matchQuery;
    });
  }, [active, query, initialAgents]);

  const resetFilters = () => {
    setActive("all");
    setQuery("");
  };

  const hasFilters = active !== "all" || query.trim().length > 0;

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
                  Identity and reputation fields are synchronized from 8004scan. The permission
                  policy is shown before you sign anything.
                </p>
                {initialAgents[0]?.sourceSyncedAt && (
                  <p className="num mt-3 text-[11px] text-muted-foreground">
                    Registry cache updated {initialAgents[0].sourceSyncedAt.slice(0, 10)} UTC
                  </p>
                )}
              </div>
              <div className="relative w-full lg:w-72">
                <label htmlFor="agent-search" className="sr-only">Search agents or operators</label>
                <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="agent-search"
                  type="search"
                  maxLength={100}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search agent or operator"
                  className="h-12 rounded-lg border-border bg-card pl-10 shadow-panel transition-colors duration-200 focus-visible:border-brass"
                />
              </div>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Agent categories">
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
          <div className="mb-6 flex min-h-9 flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground" aria-live="polite">
              <span className="num font-semibold text-foreground">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "agent" : "agents"} found
            </p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                <RotateCcw aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>
          {filtered.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i, 5) * 45}>
                  <AgentCard agent={a} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="panel p-10 text-center">
              <p className="text-base font-semibold text-foreground">No matching agents</p>
              <p className="mt-2 text-sm text-muted-foreground">
                No agent matches that filter. Clear the search or pick another category.
              </p>
              <Button variant="steel" size="sm" className="mt-5" onClick={resetFilters}>
                <RotateCcw aria-hidden="true" />
                Show all agents
              </Button>
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
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-11 cursor-pointer rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ease-instrument focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "border-transparent bg-primary text-primary-foreground shadow-brass"
          : "border-border bg-card text-foreground/85 hover:border-border-strong hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
