"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, RefreshCw, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { getAgent, hires as seedHires, shortAddress, type Hire } from "@/lib/agents";

export default function Dashboard() {
  const [rows, setRows] = useState<Hire[]>(seedHires);
  const [syncing, setSyncing] = useState(false);

  const revoke = (id: string) =>
    setRows((r) =>
      r.map((h) => (h.id === id ? { ...h, status: "revoked", expiresIn: "revoked" } : h)),
    );

  const activeCount = rows.filter((h) => h.status === "active").length;
  const totalCap = rows
    .filter((h) => h.status === "active")
    .reduce((sum, h) => sum + h.spendCap, 0);
  const totalSpent = rows
    .filter((h) => h.status === "active")
    .reduce((sum, h) => sum + h.spent, 0);

  const sync = () => {
    setSyncing(true);
    window.setTimeout(() => setSyncing(false), 900);
  };

  return (
    <Shell>
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 pt-12 pb-10">
          <Reveal>
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="num text-[11px] tracking-[0.2em] text-brass uppercase">
                  Permission ledger
                </p>
                <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">Granted authority</h1>
                <p className="mt-4 max-w-xl text-muted-foreground">
                  Every row is read live from the Altana Keystore at render time. Cached status is
                  used for filtering only, never for what you see here.
                </p>
              </div>
              <Button variant="steel" onClick={sync}>
                <RefreshCw className={syncing ? "animate-spin" : ""} />
                {syncing ? "Reading keystore" : "Re-read keystore"}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="panel mt-10 grid divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
              <Summary label="Active sessions" value={`${activeCount}`} accent />
              <Summary label="Combined spend cap" value={`$${totalCap.toLocaleString("en-US")}`} />
              <Summary
                label="Spent against caps"
                value={`$${totalSpent.toLocaleString("en-US")}`}
              />
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] space-y-5 px-5 py-14">
        {rows.map((h, i) => {
          const agent = getAgent(h.agentId);
          const pct = Math.min(100, Math.round((h.spent / h.spendCap) * 100));
          const isActive = h.status === "active";
          return (
            <Reveal key={h.id} delay={i * 80}>
              <article className="panel overflow-hidden">
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isActive ? "pulse-live bg-live" : "bg-destructive"
                      }`}
                    />
                    <h2 className="font-display text-lg font-semibold">{agent?.name}</h2>
                    <span className="num rounded border border-border px-2 py-0.5 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                      {h.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {agent && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/agent/${agent.id}`}>
                          Agent terms
                          <ArrowUpRight />
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!isActive}
                      onClick={() => revoke(h.id)}
                    >
                      <ShieldOff />
                      {isActive ? "Revoke onchain" : "Revoked"}
                    </Button>
                  </div>
                </header>

                <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_1fr]">
                  <div>
                    <div className="flex items-end justify-between">
                      <span className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                        Spend against cap
                      </span>
                      <span className="num text-sm">
                        ${h.spent.toLocaleString("en-US")} / ${h.spendCap.toLocaleString("en-US")}
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-panel">
                      <div
                        className={`h-full rounded-full transition-[width] duration-1000 ease-instrument ${
                          isActive ? "bg-brass-gradient" : "bg-destructive/70"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="num mt-3 flex justify-between text-[10px] text-muted-foreground">
                      <span>{pct}% used</span>
                      <span>
                        {isActive ? `expires in ${h.expiresIn}` : "permission ended"}
                      </span>
                    </div>

                    <dl className="mt-6 grid gap-3 text-xs sm:grid-cols-2">
                      <Field k="Session key" v={shortAddress(h.sessionKey)} />
                      <Field k="Granted" v={h.createdAt} />
                      <Field
                        k="Allowlist"
                        v={`${agent?.allowlist.length ?? 0} contracts`}
                      />
                      <Field k="Fee" v={`${agent?.feeBps ?? 0} bps`} />
                    </dl>
                  </div>

                  <div className="panel-inset p-4">
                    <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                      Onchain proof
                    </p>
                    <div className="mt-3 space-y-3">
                      <TxRow label="Keystore registration" hash={h.keystoreTx} />
                      <TxRow label="ERC-8183 hire" hash={h.hireTx} />
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </Shell>
  );
}

function Summary({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-6 py-6">
      <div className={`num text-3xl ${accent ? "text-brass" : ""}`}>{value}</div>
      <div className="mt-2 text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="num text-foreground">{v}</dd>
    </div>
  );
}

function TxRow({ label, hash }: { label: string; hash: string }) {
  return (
    <div>
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="num mt-1 flex items-start gap-2 text-[10px] break-all text-foreground/80 transition-colors duration-300 hover:text-brass">
        {hash}
        <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
      </p>
    </div>
  );
}