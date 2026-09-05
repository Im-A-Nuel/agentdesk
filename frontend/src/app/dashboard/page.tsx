"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { ArrowUpRight, KeyRound, Loader2, RefreshCw, ShieldOff, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { CopyButton } from "@/components/site/copy-button";
import { CountUp } from "@/components/site/count-up";
import { getAgent, shortAddress } from "@/lib/agents";
import { getMyHires, revokeHire, type HireWithLive } from "@/lib/api";

const EXPLORER = "https://testnet.bscscan.com";

export default function Dashboard() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  const [rows, setRows] = useState<HireWithLive[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const load = useCallback(
    async (wallet: string) => {
      setLoading(true);
      setError(null);
      try {
        const { hires } = await getMyHires(wallet);
        setRows(hires);
      } catch (err) {
        setRows(null);
        setError(err instanceof Error ? err.message : "Could not read the keystore");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (address) {
      load(address);
    } else {
      setRows(null);
      setError(null);
    }
  }, [address, load]);

  const reRead = async () => {
    if (!address) return;
    setSyncing(true);
    try {
      const { hires } = await getMyHires(address);
      setRows(hires);
      toast.success("Keystore state refreshed");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read the keystore");
    } finally {
      setSyncing(false);
    }
  };

  const revoke = async (id: string) => {
    if (!address) return;
    setRevokingId(id);
    try {
      const { revokeTxHash } = await revokeHire(id, address);
      setRows((r) =>
        r?.map((h) => (h.id === id ? { ...h, status: "revoked", expiresIn: "revoked" } : h)) ??
        r,
      );
      toast.success(`Session revoked onchain (${shortAddress(revokeTxHash)})`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Revoke failed");
    } finally {
      setRevokingId(null);
    }
  };

  const activeRows = rows?.filter((h) => h.status === "active") ?? [];
  const totalCap = activeRows.reduce((sum, h) => sum + h.spendCap, 0);
  const totalSpent = activeRows.reduce((sum, h) => sum + h.spent, 0);

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
                {isConnected && address && (
                  <p className="num mt-3 text-xs text-muted-foreground">
                    Connected as {shortAddress(address)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <Button variant="steel" onClick={reRead} disabled={!isConnected || syncing}>
                  <RefreshCw className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Reading keystore" : "Re-read keystore"}
                </Button>
              </div>
            </div>
          </Reveal>

          {isConnected && (
            <Reveal delay={80}>
              <div className="panel mt-10 grid divide-y divide-border sm:grid-cols-3 sm:divide-y-0 sm:divide-x">
                <Summary
                  label="Active sessions"
                  value={activeRows.length}
                  format={(n) => `${n}`}
                  accent
                />
                <Summary
                  label="Combined spend cap"
                  value={totalCap}
                  format={(n) => `$${n.toLocaleString("en-US")}`}
                />
                <Summary
                  label="Spent against caps"
                  value={totalSpent}
                  format={(n) => `$${n.toLocaleString("en-US")}`}
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] space-y-5 px-5 py-14">
        {!isConnected && <NotConnected onConnect={() => openConnectModal?.()} />}

        {isConnected && loading && (
          <div className="space-y-5">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="panel h-48 animate-pulse" />
            ))}
          </div>
        )}

        {isConnected && !loading && error && (
          <div className="panel p-10 text-center">
            <p className="text-sm font-semibold text-foreground">Keystore could not be read</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
            <Button variant="steel" size="sm" className="mt-5" onClick={() => address && load(address)}>
              <RefreshCw />
              Try again
            </Button>
          </div>
        )}

        {isConnected && !loading && !error && rows !== null && rows.length === 0 && (
          <div className="panel p-12 text-center">
            <KeyRound className="mx-auto h-6 w-6 text-brass" />
            <p className="mt-4 text-base font-semibold text-foreground">No sessions yet</p>
            <p className="mt-2 max-w-md mx-auto text-sm text-muted-foreground">
              You have not hired an agent. Browsing costs nothing, and no wallet approval happens
              until you set a cap and an expiry.
            </p>
            <Button variant="brass" size="lg" className="mt-6" asChild>
              <Link href="/">Browse the marketplace</Link>
            </Button>
          </div>
        )}

        {rows?.map((h, i) => {
          const agent = getAgent(h.agentId);
          const pct = Math.min(100, Math.round((h.spent / h.spendCap) * 100));
          const isActive = h.status === "active";
          const isRevoking = revokingId === h.id;
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
                      disabled={!isActive || isRevoking}
                      onClick={() => revoke(h.id)}
                    >
                      {isRevoking ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ShieldOff />
                      )}
                      {isRevoking ? "Revoking..." : isActive ? "Revoke onchain" : "Revoked"}
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
                      <span>{isActive ? `expires in ${h.expiresIn}` : "permission ended"}</span>
                    </div>

                    <dl className="mt-6 grid gap-3 text-xs sm:grid-cols-2">
                      <Field k="Session key" v={shortAddress(h.sessionKeyAddress)} />
                      <Field k="Granted" v={h.createdAt} />
                      <Field k="Allowlist" v={`${agent?.allowlist.length ?? 0} contracts`} />
                      <Field k="Fee" v={`${agent?.feeBps ?? 0} bps`} />
                    </dl>
                  </div>

                  <div className="panel-inset p-4">
                    <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                      Onchain proof
                    </p>
                    <div className="mt-3 space-y-3">
                      <TxRow label="Keystore registration" hash={h.keystoreTxHash} />
                      <TxRow label="ERC-8183 hire" hash={h.erc8183TxHash} />
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

function NotConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="panel p-12 text-center">
      <Wallet className="mx-auto h-6 w-6 text-brass" />
      <p className="mt-4 text-base font-semibold text-foreground">Connect your wallet to continue</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        The dashboard reads session state live from the Altana Keystore for your address. No
        session keys or funds are moved by connecting.
      </p>
      <Button variant="brass" size="lg" className="mt-6" onClick={onConnect}>
        <Wallet />
        Connect wallet
      </Button>
    </div>
  );
}

function Summary({
  label,
  value,
  format,
  accent,
}: {
  label: string;
  value: number;
  format: (n: number) => string;
  accent?: boolean;
}) {
  return (
    <div className="px-6 py-6">
      <CountUp
        value={value}
        format={format}
        className={`num text-3xl ${accent ? "text-brass" : ""}`}
      />
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
      <p className="num mt-1 flex items-start gap-2 text-[10px] break-all text-foreground/80">
        <a
          href={`${EXPLORER}/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          className="transition-colors duration-300 hover:text-brass"
        >
          {hash}
        </a>
        <CopyButton value={hash} label={`Copy ${label} hash`} />
        <ArrowUpRight className="mt-0.5 h-3 w-3 shrink-0 opacity-60" />
      </p>
    </div>
  );
}