"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { CountUp } from "@/components/site/count-up";
import { agents, categories, categoryDotClass, shortAddress } from "@/lib/agents";
import { faqs, plans, steps, triad } from "@/lib/content";

const registryStats = [
  { label: "Agents in registry", value: 204_318, format: (n: number) => n.toLocaleString("en-US") },
  { label: "Sessions registered", value: 12_904, format: (n: number) => n.toLocaleString("en-US") },
  { label: "Capped volume routed", value: 163.1, format: (n: number) => `$${n.toFixed(1)}M` },
  { label: "Unbounded approvals", value: 0, format: (n: number) => `${n}` },
];

const trustedBy = [
  "ERC-8004 REGISTRY",
  "ALTANA KEYSTORE",
  "ERC-8183 HIRE",
  "8004SCAN",
  "BNB SMART CHAIN",
  "PANCAKESWAP",
  "VENUS",
  "THENA",
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <Shell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="grid-lines pointer-events-none absolute inset-0 opacity-60" />
        <div
          className="pointer-events-none absolute -top-72 left-1/2 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full opacity-[0.14] blur-[140px]"
          style={{ background: "var(--gradient-brass)" }}
        />
        <div className="relative mx-auto max-w-[1240px] px-5 pt-16 pb-10 sm:pt-24">
          <Reveal className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-semibold shadow-panel">
              <span className="pulse-live h-1.5 w-1.5 rounded-full bg-live" />
              Live on BNB Smart Chain testnet
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mx-auto mt-8 max-w-5xl text-center text-[2.6rem] leading-[0.98] font-extrabold sm:text-[4.6rem]">
              One desk to hire every AI agent
              <span className="mt-2 block text-brass">
                Scoped. Capped. Revocable.
              </span>
            </h1>
          </Reveal>

          <Reveal delay={150}>
            <p className="mx-auto mt-7 max-w-2xl text-center text-lg leading-relaxed text-muted-foreground">
              Over 200,000 agents are already registered on BNB Smart Chain and there is still no
              trustworthy way to hire one. AgentDesk gives you the registry data to choose well and
              an onchain permission you can prove and cancel.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button variant="brass" size="xl" asChild>
                <Link href="/marketplace">
                  Get started, it is free
                  <ArrowRight />
                </Link>
              </Button>
              <p className="text-sm leading-tight text-muted-foreground">
                Free to browse.
                <br />
                No unlimited approvals.
              </p>
            </div>
          </Reveal>

          {/* Product panel mock */}
          <Reveal delay={300}>
            <div className="panel mt-16 overflow-hidden shadow-panel">
              <div className="flex items-center justify-between border-b border-border bg-panel px-4 py-3">
                <span className="num text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
                  Registry snapshot
                </span>
                <span className="num text-[11px] text-muted-foreground">
                  source: 8004scan, synced 42s ago
                </span>
              </div>
              <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
                {registryStats.map((s) => (
                  <div key={s.label} className="px-6 py-7">
                    <CountUp value={s.value} format={s.format} className="num text-3xl font-semibold" />
                    <div className="mt-2 text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid gap-px bg-border lg:grid-cols-[260px_1fr]">
                <div className="bg-panel p-5">
                  <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
                    Categories
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {categories.map((c, i) => (
                      <li
                        key={c.id}
                        className={`flex items-center gap-2 rounded-lg px-2.5 py-2 font-semibold transition-colors duration-300 ${
                          i === 0 ? "bg-accent text-brass" : "text-foreground/70"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${categoryDotClass(c.id)}`} />
                        {c.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-card">
                  <div className="hidden gap-3 border-b border-border px-5 py-3 text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase sm:grid sm:grid-cols-[1.6fr_1.1fr_0.6fr_auto]">
                    <span>Agent</span>
                    <span>Cap used</span>
                    <span>Expires</span>
                    <span>State</span>
                  </div>
                  {agents.slice(0, 4).map((a, i) => {
                    const cap = 1500 + i * 750;
                    const spent = i === 3 ? cap : Math.round(cap * (0.22 + i * 0.17));
                    const pct = Math.round((spent / cap) * 100);
                    const pending = i === 3;
                    return (
                      <div
                        key={a.id}
                        className="flex flex-col gap-2.5 border-b border-border px-5 py-3.5 text-sm last:border-0 transition-colors duration-300 hover:bg-panel sm:grid sm:grid-cols-[1.6fr_1.1fr_0.6fr_auto] sm:items-center sm:gap-3"
                      >
                        <div className="flex items-center justify-between gap-3 sm:block">
                          <div>
                            <div className="font-semibold">{a.name}</div>
                            <div className="num text-[11px] text-muted-foreground">
                              {shortAddress(a.address)}
                            </div>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold sm:hidden ${
                              pending ? "bg-warn/15 text-warn" : "bg-live/12 text-live"
                            }`}
                          >
                            {pending ? "PENDING" : "ACTIVE"}
                          </span>
                        </div>
                        <div>
                          <div className="num flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>${spent.toLocaleString("en-US")}</span>
                            <span>${cap.toLocaleString("en-US")}</span>
                          </div>
                          <div className="mt-1 h-1 overflow-hidden rounded-full bg-panel">
                            <div
                              className={`h-full rounded-full ${
                                pending ? "bg-warn" : "bg-brass-gradient"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="num hidden text-foreground/80 sm:block">{7 + i * 3}d</span>
                        <span
                          className={`hidden rounded-full px-2.5 py-1 text-[11px] font-bold sm:inline-flex ${
                            pending ? "bg-warn/15 text-warn" : "bg-live/12 text-live"
                          }`}
                        >
                          {pending ? "PENDING" : "ACTIVE"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Trusted by ticker */}
        <div className="border-y border-border bg-panel py-5">
          <div className="mx-auto flex max-w-[1240px] items-center gap-8 overflow-hidden px-5">
            <span className="num shrink-0 text-[11px] font-bold tracking-[0.2em] text-muted-foreground uppercase">
              Built on
            </span>
            <div className="overflow-hidden">
              <div className="ticker-track flex w-max gap-10 pr-10">
                {[...trustedBy, ...trustedBy].map((t, i) => (
                  <span
                    key={`${t}-${i}`}
                    className="num text-[12px] font-semibold tracking-[0.16em] text-foreground/50"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Permission triad */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 py-20">
          <Reveal>
            <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">
              Non negotiable limits
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold sm:text-[2.9rem]">
              Three constraints ship with every hire
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {triad.map((t, i) => (
              <Reveal key={t.title} delay={i * 90}>
                <div className="panel hairline-hover h-full p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brass-gradient text-primary-foreground">
                    <t.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{t.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 py-20">
          <Reveal>
            <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">Flow</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold sm:text-[2.9rem]">
              Discovery to hire in four steps
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 90}>
                <div className="panel hairline-hover group relative h-full overflow-hidden p-7">
                  <span
                    aria-hidden
                    className="num pointer-events-none absolute -top-3 right-1 text-6xl font-extrabold tracking-tight text-foreground/[0.045]"
                  >
                    {s.n}
                  </span>
                  <div className="relative flex items-center justify-between">
                    <span className="num text-xs font-bold text-muted-foreground">{s.n}</span>
                    <s.icon className="h-4.5 w-4.5 text-brass transition-transform duration-500 ease-instrument group-hover:scale-110" />
                  </div>
                  <h3 className="relative mt-6 text-lg font-bold">{s.title}</h3>
                  <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-20 border-b border-border bg-panel">
        <div className="mx-auto max-w-[1240px] px-5 py-20">
          <Reveal>
            <div className="text-center">
              <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">
                Pricing
              </p>
              <h2 className="mt-4 text-3xl font-extrabold sm:text-[2.9rem]">
                Pay only when an agent works for you
              </h2>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 90}>
                <div
                  className={`panel hairline-hover flex h-full flex-col p-7 ${
                    p.featured ? "border-brass/40 shadow-panel" : ""
                  }`}
                >
                  {p.featured && (
                    <span className="mb-4 w-fit rounded-full bg-brass-gradient px-3 py-1 text-[11px] font-bold tracking-wide text-primary-foreground uppercase">
                      Most hired
                    </span>
                  )}
                  <h3 className="text-lg font-bold">{p.name}</h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="num text-4xl font-semibold">{p.price}</span>
                    <span className="pb-1 text-xs text-muted-foreground">{p.note}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-live" />
                        <span className="text-foreground/80">{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={p.featured ? "brass" : "steel"}
                    size="lg"
                    className="mt-7 w-full"
                    asChild
                  >
                    <Link href="/marketplace">{p.cta}</Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-[1240px] px-5 py-20">
        <Reveal>
          <h2 className="text-3xl font-extrabold sm:text-[2.9rem]">Questions worth asking</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 70}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="panel hairline-hover w-full cursor-pointer p-6 text-left"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-[17px] font-bold">{f.q}</h3>
                  <ChevronRight
                    className={`mt-0.5 h-4 w-4 shrink-0 text-brass transition-transform duration-400 ease-instrument ${
                      openFaq === i ? "rotate-90" : ""
                    }`}
                  />
                </div>
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-500 ease-instrument"
                  style={{
                    gridTemplateRows: openFaq === i ? "1fr" : "0fr",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p className="overflow-hidden text-sm leading-relaxed text-muted-foreground">
                    <span className="block pt-3">{f.a}</span>
                  </p>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-[1240px] px-5 pb-20">
        <Reveal>
          <div className="panel relative overflow-hidden p-10 text-center shadow-panel sm:p-16">
            <div
              className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[110px]"
              style={{ background: "var(--gradient-brass)" }}
            />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold sm:text-[2.9rem]">
              Give an agent authority, not your whole wallet
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-muted-foreground">
              Set the cap, name the contracts, pick the expiry. Everything else stays out of reach.
            </p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="brass" size="xl" asChild>
                <Link href="/marketplace">
                  Start with an agent
                  <ArrowRight />
                </Link>
              </Button>
              <Button variant="steel" size="xl" asChild>
                <Link href="/dashboard">Open the dashboard</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </Shell>
  );
}