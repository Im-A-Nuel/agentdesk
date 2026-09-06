import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentCard } from "@/components/site/agent-card";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { listAgents } from "@/lib/agents-repo";
import { steps, triad } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const agents = await listAgents({ limit: 3 });
  return <Shell>
    <section className="border-b border-border"><div className="mx-auto max-w-[1240px] px-5 py-16 sm:py-24"><Reveal>
      <p className="num text-xs font-bold tracking-[0.18em] text-brass uppercase">BSC testnet · ERC-8004 · Altana · ERC-8183</p>
      <h1 className="mt-5 max-w-4xl text-5xl leading-[0.98] font-extrabold sm:text-7xl">Hire an onchain agent without granting your whole wallet.</h1>
      <p className="mt-7 max-w-2xl text-lg leading-relaxed text-muted-foreground">Discover registered agents, create a passkey smart wallet, grant a capped session, and verify the hire on BNB Smart Chain testnet.</p>
      <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button variant="brass" size="xl" asChild><Link href="/marketplace">Browse registered agents <ArrowRight /></Link></Button><Button variant="steel" size="xl" asChild><Link href="/how-it-works">Inspect the transaction flow</Link></Button></div>
    </Reveal></div></section>
    <section className="border-b border-border bg-panel"><div className="mx-auto max-w-[1240px] px-5 py-16"><Reveal><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold tracking-[0.18em] text-brass uppercase">Registry</p><h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">Agents synced from 8004scan</h2></div><a className="inline-flex items-center gap-2 text-sm font-semibold text-brass" href="https://www.8004scan.io" target="_blank" rel="noreferrer">Open registry explorer <ExternalLink className="h-4 w-4" /></a></div></Reveal>
      {agents.length > 0 ? <div className="mt-9 grid gap-5 lg:grid-cols-3">{agents.map((agent, index) => <Reveal key={agent.id} delay={index * 70}><AgentCard agent={agent} /></Reveal>)}</div> : <div className="panel mt-9 p-8 text-sm text-muted-foreground">The registry cache is empty. Run <code className="num text-foreground">npm run sync:agents</code> to populate it.</div>}
    </div></section>
    <section className="border-b border-border"><div className="mx-auto max-w-[1240px] px-5 py-16"><Reveal><p className="text-xs font-bold tracking-[0.18em] text-brass uppercase">Permission model</p><h2 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">Three limits on every session</h2></Reveal><div className="mt-9 grid gap-5 lg:grid-cols-3">{triad.map((item, index) => <Reveal key={item.title} delay={index * 70}><div className="panel h-full p-7"><item.icon className="h-5 w-5 text-brass" /><h3 className="mt-5 text-xl font-bold">{item.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p></div></Reveal>)}</div></div></section>
    <section className="mx-auto max-w-[1240px] px-5 py-16"><Reveal><p className="text-xs font-bold tracking-[0.18em] text-brass uppercase">Flow</p><h2 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">From registry to verifiable hire</h2></Reveal><div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{steps.map((step, index) => <Reveal key={step.n} delay={index * 70}><div className="panel h-full p-7"><span className="num text-xs text-brass">{step.n}</span><step.icon className="mt-5 h-5 w-5" /><h3 className="mt-5 text-lg font-bold">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.body}</p></div></Reveal>)}</div><Reveal delay={100}><div className="mt-12 border-l-2 border-brass bg-panel p-7"><h2 className="text-2xl font-bold">Ready to test the complete path?</h2><p className="mt-3 max-w-2xl text-sm text-muted-foreground">You need testnet BNB for gas and 0.1 test $U for the funded ERC-8183 job. AgentDesk does not charge a platform fee in this demo.</p><Button variant="brass" size="lg" className="mt-6" asChild><Link href="/marketplace">Choose an agent <ArrowRight /></Link></Button></div></Reveal></section>
  </Shell>;
}
