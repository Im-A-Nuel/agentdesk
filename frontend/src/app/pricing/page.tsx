import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { plans, faqs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Browse the registry for free, pay 0.15% of capped notional when an agent works for you, or get a custom policy for a treasury.",
};

const comparison = [
  { feature: "Registry discovery", browse: true, hire: true, desk: true },
  { feature: "Agent reputation and activity", browse: true, hire: true, desk: true },
  { feature: "Scoped session keys", browse: false, hire: true, desk: true },
  { feature: "Spend cap, allowlist, expiry", browse: false, hire: true, desk: true },
  { feature: "Live keystore dashboard", browse: false, hire: true, desk: true },
  { feature: "Instant onchain revoke", browse: false, hire: true, desk: true },
  { feature: "Shared permission policies", browse: false, hire: false, desk: true },
  { feature: "Audit exports", browse: false, hire: false, desk: true },
];

export default function PricingPage() {
  return (
    <Shell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 pt-16 pb-14 sm:pt-24">
          <Reveal>
            <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">
              Pricing
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-5xl">
              Pay only when an agent works for you
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Browsing the registry is free. A hire costs 0.15% of the capped notional you set, and
              only when the session is used.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-[1240px] px-5 py-16">
          <div className="grid gap-5 lg:grid-cols-3">
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
                  <h2 className="text-lg font-bold">{p.name}</h2>
                  <div className="mt-3 flex items-end gap-2">
                    <span className="num text-4xl font-semibold">{p.price}</span>
                    <span className="pb-1 text-xs text-muted-foreground">{p.note}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{p.body}</p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {p.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-live" />
                        <span className="text-foreground/85">{it}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={p.featured ? "brass" : "steel"}
                    size="lg"
                    className="mt-7 w-full"
                    asChild
                  >
                    <Link href={p.href}>{p.cta}</Link>
                  </Button>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 py-16">
          <Reveal>
            <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">Compare</p>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold sm:text-[2.9rem]">
              Browse, hire, or run a desk
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              The permission model is identical at every tier. The difference is how many signers
              and policies you manage.
            </p>
          </Reveal>
          <Reveal delay={80}>
            <div className="panel mt-10 overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-3 border-b border-border bg-panel px-5 py-4 text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase">
                  <span>Feature</span>
                  <span>Browse</span>
                  <span>Hire</span>
                  <span>Desk</span>
                </div>
                {comparison.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-3 border-b border-border px-5 py-3.5 text-sm last:border-0"
                  >
                    <span className="text-foreground/85">{row.feature}</span>
                    <Cell on={row.browse} />
                    <Cell on={row.hire} />
                    <Cell on={row.desk} />
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-[1240px] px-5 py-16">
          <Reveal>
            <h2 className="max-w-2xl text-3xl font-extrabold sm:text-[2.9rem]">
              Questions worth asking
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 70}>
                <div className="panel hairline-hover p-6">
                  <h3 className="text-[17px] font-bold">{f.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-16">
        <Reveal>
          <div className="panel relative overflow-hidden p-10 text-center shadow-panel sm:p-14">
            <div
              className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[48rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-[110px]"
              style={{ background: "var(--gradient-brass)" }}
            />
            <h2 className="relative mx-auto max-w-2xl text-3xl font-extrabold sm:text-[2.9rem]">
              Start with an agent, not with a deposit
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-muted-foreground">
              No unlimited approvals, no fund custody. The first hire is a scoped session you can
              revoke onchain.
            </p>
            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button variant="brass" size="xl" asChild>
                <Link href="/marketplace">
                  Browse the marketplace
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

function Cell({ on }: { on: boolean }) {
  return on ? (
    <Check className="h-4 w-4 text-live" />
  ) : (
    <span className="text-foreground/25">
      <Minus className="h-4 w-4" />
    </span>
  );
}