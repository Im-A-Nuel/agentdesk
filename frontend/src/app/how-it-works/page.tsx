import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileCheck2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { steps, triad } from "@/lib/content";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Discovery to hire in four steps: discover an agent, review its terms, grant a scoped session, and revoke it anytime onchain.",
};

const txSteps = [
  {
    tx: "TX 01",
    icon: FileCheck2,
    title: "Session granted",
    body: "The SDK creates a session key and registers its daily spend limit, contract allowlist, and expiry in the Altana Keystore.",
  },
  {
    tx: "TX 02",
    icon: Wallet,
    title: "ERC-8183 job funded",
    body: "The Altana smart wallet creates and funds a 0.1 test $U job. Revoke is an optional later transaction.",
  },
];

export default function HowItWorksPage() {
  return (
    <Shell>
      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 pt-16 pb-14 sm:pt-24">
          <Reveal>
            <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">Flow</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-5xl">
              Discovery to hire in four steps
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Every hire on AgentDesk ends with a scoped session key registered in the Altana
              Keystore. Nothing is approved until you set a daily limit, name the contracts, and pick an
              expiry.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
                  <h2 className="relative mt-6 text-lg font-bold">{s.title}</h2>
                  <p className="relative mt-3 text-sm leading-relaxed text-muted-foreground">
                    {s.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-panel">
        <div className="mx-auto max-w-[1240px] px-5 py-16">
          <Reveal>
            <p className="text-[12px] font-bold tracking-[0.18em] text-brass uppercase">
              Onchain
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-extrabold sm:text-[2.9rem]">
              Two transactions, both verifiable
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Each hire leaves a chain of hashes you can check in a BSC testnet explorer, from the
              keystore registration to the ERC-8183 hire.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {txSteps.map((t, i) => (
              <Reveal key={t.tx} delay={i * 90}>
                <div className="panel h-full p-7">
                  <div className="flex items-center justify-between">
                    <span className="num text-[11px] font-bold tracking-[0.12em] text-brass uppercase">
                      {t.tx}
                    </span>
                    <t.icon className="h-4.5 w-4.5 text-brass opacity-80" />
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{t.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 py-16">
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

      <section className="mx-auto max-w-[1240px] px-5 py-16">
        <Reveal>
          <div className="panel p-10 text-center shadow-panel sm:p-14">
            <div className="flex flex-col items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-xl bg-brass-gradient text-primary-foreground">
                <Wallet className="h-5 w-5" />
              </span>
              <h2 className="max-w-2xl text-2xl font-extrabold sm:text-3xl">
                Your passkey controls the Altana smart wallet.
              </h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                Browsing needs no wallet. Hiring creates or recovers a passkey smart wallet, which
                must hold test BNB and test $U for the onchain flow.
              </p>
              <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row">
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
          </div>
        </Reveal>
      </section>
    </Shell>
  );
}
