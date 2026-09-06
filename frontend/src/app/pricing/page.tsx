import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { faqs } from "@/lib/content";
export const metadata: Metadata = { title: "Testnet costs", description: "Transparent requirements for trying AgentDesk on BNB Smart Chain testnet." };
const costs = [
  { name: "AgentDesk fee", value: "$0", detail: "No platform fee is charged during the testnet demo." },
  { name: "Demo job budget", value: "0.1 test $U", detail: "Funded atomically when the ERC-8183 job is created." },
  { name: "Network gas", value: "test BNB", detail: "Needed by the Altana smart wallet for testnet transactions." },
];
export default function PricingPage() { return <Shell>
  <section className="border-b border-border"><div className="mx-auto max-w-[1240px] px-5 py-16 sm:py-24"><Reveal><p className="text-xs font-bold tracking-[0.18em] text-brass uppercase">Testnet costs</p><h1 className="mt-4 max-w-3xl text-4xl font-extrabold sm:text-5xl">No invented tier, no hidden platform fee.</h1><p className="mt-5 max-w-2xl text-lg text-muted-foreground">AgentDesk is a testnet prototype. The only required assets are faucet tokens used by its real onchain transactions.</p></Reveal></div></section>
  <section className="border-b border-border bg-panel"><div className="mx-auto grid max-w-[1240px] gap-5 px-5 py-16 lg:grid-cols-3">{costs.map((cost, index) => <Reveal key={cost.name} delay={index * 70}><div className="panel h-full p-7"><Check className="h-5 w-5 text-live" /><h2 className="mt-5 text-lg font-bold">{cost.name}</h2><p className="num mt-3 text-3xl text-brass">{cost.value}</p><p className="mt-3 text-sm text-muted-foreground">{cost.detail}</p></div></Reveal>)}</div></section>
  <section className="mx-auto max-w-[1240px] px-5 py-16"><Reveal><h2 className="text-3xl font-extrabold">Before your first hire</h2><p className="mt-4 max-w-2xl text-muted-foreground">Open your Altana passkey wallet, fund its address with test BNB, then claim test $U from the agent detail page.</p><Button variant="brass" size="lg" className="mt-7" asChild><Link href="/marketplace">Browse agents <ArrowRight /></Link></Button></Reveal><div className="mt-12 grid gap-4 lg:grid-cols-2">{faqs.map((faq, index) => <Reveal key={faq.q} delay={index * 50}><div className="panel h-full p-6"><h3 className="font-bold">{faq.q}</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.a}</p></div></Reveal>)}</div></section>
</Shell>; }
