"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CheckCircle2,
  Coins,
  KeyRound,
  Layers,
  Loader2,
  Lock,
  ExternalLink,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { CopyButton } from "@/components/site/copy-button";
import { TokenIcon } from "@/components/site/token-icon";
import { categoryBadgeVariant, categoryLabel, shortAddress, type Agent } from "@/lib/agents";
import {
  claimTestPaymentToken,
  clearStoredAltanaWallet,
  grantSessionAndHire,
  openAltanaWallet,
  readAltanaBalances,
  revokeOrphanSession,
  storedAltanaWalletAddress,
  storedOrphanSession,
  type OnchainHireResult,
  type AltanaBalances,
  type AltanaWallet,
} from "@/lib/altana-client";
import { createHire, type HireResult } from "@/lib/api";

const EXPLORER = "https://testnet.bscscan.com";

const durations = [7, 14, 30, 90];
type PendingHire = OnchainHireResult & {
  agentId: string;
  spendCap: number;
  durationSeconds: number;
  userWallet: string;
};

export function AgentDetail({ agent, related }: { agent: Agent; related: Agent[] }) {
  const [cap, setCap] = useState(2500);
  const [days, setDays] = useState(14);
  const [granted, setGranted] = useState(false);
  const [hiring, setHiring] = useState(false);
  const [hireError, setHireError] = useState<string | null>(null);
  const [hireResult, setHireResult] = useState<HireResult | null>(null);
  const [altanaWallet, setAltanaWallet] = useState<AltanaWallet | null>(null);
  const [altanaAddress, setAltanaAddress] = useState<string | null>(null);
  const [balances, setBalances] = useState<AltanaBalances | null>(null);
  const [preparingWallet, setPreparingWallet] = useState(false);
  const [claimingTokens, setClaimingTokens] = useState(false);
  const [pendingHire, setPendingHire] = useState<PendingHire | null>(null);
  const [orphanSession, setOrphanSession] = useState<`0x${string}` | null>(null);
  const [cleaningSession, setCleaningSession] = useState(false);

  useEffect(() => {
    setAltanaAddress(storedAltanaWalletAddress());
    setOrphanSession(storedOrphanSession());
    const saved = window.localStorage.getItem(`agentdesk:pending-hire:${agent.id}`);
    if (saved) {
      try {
        setPendingHire(JSON.parse(saved) as PendingHire);
      } catch {
        window.localStorage.removeItem(`agentdesk:pending-hire:${agent.id}`);
      }
    }
  }, [agent.id]);

  const expiry = useMemo(() => {
    const d = new Date(Date.now() + days * 86_400_000);
    return d.toISOString().slice(0, 10);
  }, [days]);
  const hasGas = balances ? BigInt(balances.nativeWei) > 0n : false;
  const hasHireBudget = balances?.paymentTokenRaw
    ? BigInt(balances.paymentTokenRaw) >= 100_000_000_000_000_000n
    : false;

  const refreshBalances = async (wallet: AltanaWallet) => {
    const next = await readAltanaBalances(wallet);
    setBalances(next);
  };

  const prepareWallet = async () => {
    setPreparingWallet(true);
    setHireError(null);
    try {
      const wallet = await openAltanaWallet();
      setAltanaWallet(wallet);
      setAltanaAddress(wallet.address);
      await refreshBalances(wallet);
      toast.success("Altana wallet ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not open the Altana wallet";
      setHireError(message);
      toast.error(message);
    } finally {
      setPreparingWallet(false);
    }
  };

  const claimTokens = async () => {
    if (!altanaWallet) return;
    setClaimingTokens(true);
    setHireError(null);
    try {
      await claimTestPaymentToken(altanaWallet);
      await refreshBalances(altanaWallet);
      toast.success("10 test $U received");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not claim test $U";
      setHireError(message);
      toast.error(message);
    } finally {
      setClaimingTokens(false);
    }
  };

  const startWithNewWallet = () => {
    clearStoredAltanaWallet();
    setAltanaWallet(null);
    setAltanaAddress(null);
    setBalances(null);
    setHireError(null);
    toast.info("Create a new passkey wallet, then keep this tab open while funding it.");
  };

  const handleHire = async () => {
    if (!altanaWallet && !pendingHire) {
      await prepareWallet();
      return;
    }
    setHiring(true);
    setHireError(null);
    try {
      let evidence = pendingHire;
      if (!evidence) {
        if (!altanaWallet) throw new Error("Open the Altana wallet before hiring");
        const onchain = await grantSessionAndHire({ wallet: altanaWallet, agent, spendCap: cap, durationSeconds: days * 86_400 });
        evidence = { agentId: agent.id, spendCap: cap, durationSeconds: days * 86_400, userWallet: onchain.altanaWalletAddress, ...onchain };
        window.localStorage.setItem(`agentdesk:pending-hire:${agent.id}`, JSON.stringify(evidence));
        setPendingHire(evidence);
      }
      const { hire } = await createHire(evidence);
      setHireResult(hire);
      setGranted(true);
      setPendingHire(null);
      window.localStorage.removeItem(`agentdesk:pending-hire:${agent.id}`);
      toast.success("Session registered onchain");
    } catch (err) {
      const savedPending = window.localStorage.getItem(`agentdesk:pending-hire:${agent.id}`);
      setOrphanSession(storedOrphanSession());
      setHireError(
        savedPending
          ? "The onchain hire is confirmed, but its dashboard record was not saved. Retry without signing another transaction."
          : err instanceof Error ? err.message : "Hire failed",
      );
      toast.error("Hire failed");
    } finally {
      setHiring(false);
    }
  };

  const cleanOrphanSession = async () => {
    setCleaningSession(true);
    try {
      const wallet = altanaWallet ?? await openAltanaWallet();
      setAltanaWallet(wallet);
      await revokeOrphanSession(wallet, orphanSession!);
      setOrphanSession(null);
      toast.success("Leftover session revoked onchain");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not revoke the leftover session");
    } finally {
      setCleaningSession(false);
    }
  };

  return (
    <Shell>
      <div className="border-b border-border">
        <div className="mx-auto max-w-[1240px] px-5 pt-10 pb-14">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/marketplace">
              <ArrowLeft />
              Back to marketplace
            </Link>
          </Button>

          <Reveal className="mt-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Badge variant={categoryBadgeVariant(agent.category)}>
                  {categoryLabel(agent.category)}
                </Badge>
                <h1 className="mt-4 text-4xl font-semibold sm:text-5xl">{agent.name}</h1>
                <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{agent.tagline}</p>
                <p className="num mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="rounded border border-border px-2 py-1">{agent.address}</span>
                  <span>operator {agent.operator}</span>
                  <span>registered {agent.registeredAt}</span>
                </p>
              </div>
              <div className="panel grid grid-cols-3 divide-x divide-border">
                <Stat label="Reputation" value={`${agent.reputation}`} accent />
                <Stat label="Feedbacks" value={`${agent.jobs}`} />
                <Stat label="Validations" value={`${agent.activity[1]?.value ?? 0}`} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 py-14 lg:grid-cols-[1.55fr_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <Reveal>
            <section className="panel p-7">
              <h2 className="text-xl font-semibold">What this agent does</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{agent.description}</p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {agent.capabilities.map((c) => (
                  <li key={c} className="flex gap-2.5 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brass" />
                    <span className="text-foreground/85">{c}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal delay={70}>
            <section className="panel overflow-hidden">
              <header className="flex items-center justify-between border-b border-border px-6 py-4">
                <h2 className="text-sm font-semibold">Recent activity</h2>
                <span className="num text-[11px] text-muted-foreground">from 8004scan</span>
              </header>
              <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                {agent.activity.map((a) => (
                  <div key={a.label} className="px-6 py-5">
                    <div className="num text-2xl">{a.value}</div>
                    <div className="mt-1.5 text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
                      {a.label}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </Reveal>

          <Reveal delay={140}>
            <section className="panel p-7">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-brass" />
                <h2 className="text-sm font-semibold tracking-[0.04em] uppercase">
                  Contracts requested
                </h2>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                This is the complete allowlist encoded for the session. If that signer is handed to
                an agent through a secure channel, calls outside this policy fail validation.
              </p>
              <ul className="mt-5 divide-y divide-border">
                {agent.allowlist.map((c) => (
                  <li key={c.address} className="flex items-center justify-between gap-4 py-3.5">
                    <span className="flex items-center gap-2.5 text-sm">
                      <TokenIcon symbol={c.symbol} className="h-6 w-6" />
                      {c.label}
                    </span>
                    <span className="num flex items-center gap-2 text-[11px] text-muted-foreground">
                      <a
                        href={`${EXPLORER}/address/${c.address}`}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors duration-300 hover:text-brass"
                      >
                        {shortAddress(c.address)}
                      </a>
                      <CopyButton value={c.address} label={`Copy ${c.label} address`} />
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          {related.length > 0 && (
            <Reveal delay={200}>
              <section>
                <h2 className="text-sm font-semibold tracking-[0.04em] uppercase">
                  Compare in this category
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      href={`/agent/${r.id}`}
                      className="glass-card hairline-hover p-5"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-base font-semibold">{r.name}</h3>
                        <span className="num text-xs text-brass">{r.reputation}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{r.tagline}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </Reveal>
          )}
        </div>

        {/* Hire panel */}
        <Reveal delay={90}>
          <aside className="panel sticky top-24 overflow-hidden shadow-panel">
            <header className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-brass" />
                <h2 className="text-sm font-semibold tracking-[0.04em] uppercase">
                  Grant a session
                </h2>
              </div>
              <span className="num text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
                Altana
              </span>
            </header>

            <div className="space-y-7 px-6 py-6">
              {orphanSession && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4" role="alert">
                  <p className="text-sm font-semibold text-destructive">Session cleanup required</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    A previous job failed after its session was granted. Revoke that leftover key before starting another hire.
                  </p>
                  <p className="num mt-3 flex items-start gap-2 break-all text-[10px] text-muted-foreground">
                    {orphanSession}<CopyButton value={orphanSession} label="Copy leftover session key" />
                  </p>
                  <Button variant="destructive" size="sm" className="mt-4" disabled={cleaningSession} onClick={cleanOrphanSession}>
                    {cleaningSession ? <Loader2 className="animate-spin" /> : <Lock />}
                    {cleaningSession ? "Revoking" : "Revoke leftover session"}
                  </Button>
                </div>
              )}

              {pendingHire && !granted && (
                <div className="rounded-lg border border-warn/40 bg-warn/10 p-4 text-xs leading-relaxed text-muted-foreground" role="status">
                  The onchain job is already confirmed. Retry below to save it to the dashboard. No new transaction will be signed.
                </div>
              )}

              <div>
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Coins className="h-3.5 w-3.5 text-brass" />
                    Daily spend limit
                  </label>
                  <span className="num text-xl">{cap.toLocaleString("en-US")} test $U</span>
                </div>
                <Slider
                  aria-label="Daily spend limit"
                  className="mt-4"
                  value={[cap]}
                  min={100}
                  max={25_000}
                  step={100}
                  disabled={Boolean(pendingHire)}
                  onValueChange={(v) => {
                    setCap(v[0] ?? cap);
                    setGranted(false);
                    setHireResult(null);
                    setHireError(null);
                  }}
                />
                <p className="num mt-2 flex justify-between text-[10px] text-muted-foreground">
                  <span>100 test $U</span>
                  <span>25,000 test $U daily maximum</span>
                </p>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="h-3.5 w-3.5 text-brass" />
                  Duration
                </label>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={days === d}
                      onClick={() => {
                        setDays(d);
                        setGranted(false);
                        setHireResult(null);
                        setHireError(null);
                      }}
                      className={`num min-h-11 cursor-pointer rounded-md border py-2 text-xs transition-all duration-300 ease-instrument disabled:cursor-not-allowed disabled:opacity-50 ${
                        days === d
                          ? "border-brass/50 bg-brass/12 text-brass"
                          : "border-border bg-panel text-muted-foreground hover:border-border-strong hover:text-foreground"
                      }`}
                      disabled={Boolean(pendingHire)}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
                <p className="num mt-2 text-[10px] text-muted-foreground">Expires {expiry}</p>
              </div>

              <div className="panel-inset p-4">
                <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                  Permission summary
                </p>
                <dl className="num mt-3 space-y-2 text-xs">
                  <Row k="Daily limit" v={`${cap.toLocaleString("en-US")} test $U`} />
                  <Row k="Expiry" v={expiry} />
                  <Row k="Allowlist" v={`${agent.allowlist.length} contracts`} />
                  <Row k="Escrow" v="0.1 test $U" />
                  <Row k="Revoke" v="anytime, onchain" />
                </dl>
              </div>

              <div className="border-l-2 border-warn bg-warn/10 p-4 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Prototype boundary:</span> the
                ERC-8183 job is funded onchain, but AgentDesk does not transmit the private session
                signer to the listed provider. Autonomous execution and settlement are not part of
                this demo.
              </div>

              <div className="rounded-lg border border-border p-4">
                <p className="text-sm font-semibold">Altana passkey wallet</p>
                {altanaAddress ? (
                  <>
                    <p className="num mt-2 flex items-start gap-2 break-all text-[11px] text-muted-foreground">
                      {altanaAddress}
                      <CopyButton value={altanaAddress} label="Copy Altana wallet address" />
                    </p>
                    {balances && (
                      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2">
                        <p className={`rounded-md border px-2.5 py-2 ${hasGas ? "border-live/30 text-live" : "border-warn/40 text-warn"}`}>
                          <span className="block font-semibold">Gas {hasGas ? "ready" : "needed"}</span>
                          <span className="num">{Number(balances.native).toFixed(4)} tBNB</span>
                        </p>
                        <p className={`rounded-md border px-2.5 py-2 ${hasHireBudget ? "border-live/30 text-live" : "border-warn/40 text-warn"}`}>
                          <span className="block font-semibold">Job budget {hasHireBudget ? "ready" : "needed"}</span>
                          <span className="num">{balances.paymentToken} test $U</span>
                        </p>
                      </div>
                    )}
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <Button variant="steel" size="sm" asChild>
                        <a href="https://testnet.bnbchain.org/faucet-smart" target="_blank" rel="noreferrer">
                          Fund tBNB
                          <ExternalLink />
                        </a>
                      </Button>
                      <Button
                        variant="steel"
                        size="sm"
                        aria-busy={claimingTokens}
                        disabled={!altanaWallet || claimingTokens}
                        onClick={claimTokens}
                      >
                        {claimingTokens && <Loader2 className="animate-spin" />}
                        {claimingTokens ? "Claiming $U" : "Claim 10 test $U"}
                      </Button>
                    </div>
                    {!altanaWallet && (
                      <p className="mt-2 text-[11px] text-muted-foreground">Unlock the passkey wallet before claiming tokens.</p>
                    )}
                  </>
                ) : (
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Create a device-bound passkey wallet. The private key stays on this device.
                  </p>
                )}
              </div>

              <Button
                variant={granted ? "outline" : "brass"}
                size="lg"
                className="w-full"
                aria-busy={hiring || preparingWallet}
                disabled={hiring || preparingWallet || granted || Boolean(orphanSession)}
                onClick={handleHire}
              >
                {hiring ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Creating session...
                  </>
                ) : granted ? (
                  <>
                    <Lock className="text-live" />
                    Session locked
                  </>
                ) : pendingHire ? (
                  <>
                    <KeyRound />
                    Retry saving confirmed hire
                  </>
                ) : altanaAddress && !altanaWallet ? (
                  <>
                    <KeyRound />
                    Unlock passkey to hire
                  </>
                ) : altanaAddress ? (
                  <>
                    <KeyRound />
                    Hire {agent.name}
                  </>
                ) : (
                  <>
                    <KeyRound />
                    {preparingWallet ? "Opening passkey..." : "Create Altana passkey"}
                  </>
                )}
              </Button>

              {hireError && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/12 px-3 py-2 text-xs text-destructive" role="alert">
                  <p>{hireError}</p>
                  {hireError.includes("no keys registered in KeyStore") && (
                    <>
                      <p className="mt-2 leading-relaxed">
                        This passkey was created before its first onchain action and cannot be recovered yet. Start fresh with a new passkey, fund it with tBNB, then claim test $U to initialize it. New wallets now retain the public passkey reference needed to resume this step safely.
                      </p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={startWithNewWallet}>
                        Use a new passkey wallet
                      </Button>
                    </>
                  )}
                </div>
              )}

              <div
                className={`overflow-hidden transition-all duration-700 ease-instrument ${
                  granted ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="panel-inset space-y-2.5 p-4" role="status">
                  <p className="flex items-center gap-2 text-xs text-live">
                    <span className="h-1.5 w-1.5 rounded-full bg-live" />
                    Session and job confirmed onchain
                  </p>
                  {hireResult && (
                    <>
                      <p className="num flex items-start gap-2 text-[10px] break-all text-muted-foreground">
                        <span className="shrink-0">key</span>
                        <span>{shortAddress(hireResult.sessionKeyAddress)}</span>
                        <CopyButton value={hireResult.sessionKeyAddress} label="Copy session key" />
                      </p>
                      {hireResult.keystoreTxHash && (
                        <p className="num flex items-start gap-2 text-[10px] break-all text-muted-foreground">
                          <span className="shrink-0">keystore</span>
                          <a
                            href={`${EXPLORER}/tx/${hireResult.keystoreTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors duration-300 hover:text-brass"
                          >
                            {hireResult.keystoreTxHash}
                          </a>
                          <CopyButton value={hireResult.keystoreTxHash} label="Copy keystore tx" />
                        </p>
                      )}
                      <p className="num flex items-start gap-2 text-[10px] break-all text-muted-foreground">
                        <span className="shrink-0">erc8183</span>
                        <a
                          href={`${EXPLORER}/tx/${hireResult.erc8183TxHash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors duration-300 hover:text-brass"
                        >
                          {hireResult.erc8183TxHash}
                        </a>
                        <CopyButton value={hireResult.erc8183TxHash} label="Copy ERC-8183 tx" />
                      </p>
                    </>
                  )}
                  <Button variant="steel" size="sm" className="mt-1 w-full" asChild>
                    <Link href="/dashboard">Manage in dashboard</Link>
                  </Button>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-muted-foreground">
                BSC testnet only. AgentDesk verifies the Keystore grant and funded ERC-8183 job
                before saving the hire.
              </p>
            </div>
          </aside>
        </Reveal>
      </div>
    </Shell>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-foreground">{v}</dd>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-6 py-4">
      <div className={`num text-xl ${accent ? "text-brass" : ""}`}>{value}</div>
      <div className="mt-1 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </div>
    </div>
  );
}
