"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, Check, KeyRound, Loader2, RefreshCw, ShieldOff, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Reveal } from "@/components/site/reveal";
import { Shell } from "@/components/site/layout";
import { CopyButton } from "@/components/site/copy-button";
import { CountUp } from "@/components/site/count-up";
import { categoryBadgeVariant, categoryLabel, shortAddress } from "@/lib/agents";
import { openAltanaWallet, revokeOnchain, storedAltanaWalletAddress } from "@/lib/altana-client";
import { getMyHires, recordRevoke, type HireWithLive } from "@/lib/api";

const EXPLORER = "https://testnet.bscscan.com";

export default function Dashboard() {
  const [address, setAddress] = useState<string | null>(null);
  const isConnected = Boolean(address);

  const [rows, setRows] = useState<HireWithLive[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [openingWallet, setOpeningWallet] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [pendingRevoke, setPendingRevoke] = useState<HireWithLive | null>(null);

  useEffect(() => {
    setAddress(storedAltanaWalletAddress());
  }, []);

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
      const target = rows?.find((hire) => hire.id === id);
      if (!target?.sessionPublicKey) throw new Error("Session public key is unavailable");
      const { revokeTxHash, walletAddress } = await revokeOnchain(
        target.sessionPublicKey as `0x${string}`,
      );
      if (walletAddress.toLowerCase() !== address.toLowerCase()) {
        throw new Error("The selected passkey does not own this session");
      }
      await recordRevoke(id, address, revokeTxHash);
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

  const connectAltana = async () => {
    setOpeningWallet(true);
    try {
      const wallet = await openAltanaWallet();
      setAddress(wallet.address);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open Altana wallet");
    } finally {
      setOpeningWallet(false);
    }
  };

  const activeRows = rows?.filter((h) => h.status === "active") ?? [];
  const totalCap = activeRows.reduce((sum, h) => sum + h.spendCap, 0);

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
                  Each row checks the Altana Keystore when loaded. If the RPC is unavailable, the
                  row is marked clearly instead of presenting cached state as verified.
                </p>
                {isConnected && address && (
                  <p className="num mt-3 text-xs text-muted-foreground">
                    Connected as {shortAddress(address)}
                  </p>
                )}
              </div>
              {isConnected && <div className="flex items-center gap-2.5">
                <Button variant="steel" onClick={reRead} disabled={!isConnected || syncing}>
                  <RefreshCw className={syncing ? "animate-spin" : ""} />
                  {syncing ? "Reading keystore" : "Re-read keystore"}
                </Button>
              </div>}
            </div>
          </Reveal>

          {isConnected && (
            <Reveal delay={80}>
              <div className="panel mt-10 grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
                <Summary
                  label="Active sessions"
                  value={activeRows.length}
                  format={(n) => `${n}`}
                  accent
                />
                <Summary
                  label="Combined daily limits"
                  value={totalCap}
                  format={(n) => `${n.toLocaleString("en-US")} test $U`}
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] space-y-5 px-5 py-14">
        {!isConnected && <NotConnected onConnect={connectAltana} opening={openingWallet} />}

        {isConnected && loading && (
          <div className="space-y-5" role="status">
            <span className="sr-only">Loading permission ledger</span>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="panel h-48 animate-pulse" aria-hidden="true" />
            ))}
          </div>
        )}

        {isConnected && !loading && error && (
          <div className="panel p-10 text-center" role="alert">
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
              until you set a daily limit and an expiry.
            </p>
            <Button variant="brass" size="lg" className="mt-6" asChild>
              <Link href="/marketplace">Browse the marketplace</Link>
            </Button>
          </div>
        )}

{rows?.map((h, i) => {
          const agent = h.agent;
          const isActive = h.status === "active";
          const isRevoking = revokingId === h.id;
          const statusVariant: "success" | "destructive" | "outline" = isActive
            ? "success"
            : h.status === "revoked"
              ? "destructive"
              : "outline";
          return (
            <Reveal key={h.id} delay={Math.min(i, 5) * 45}>
              <article
                className={`panel overflow-hidden transition-shadow duration-300 ${
                  isActive ? "shadow-panel" : ""
                }`}
              >
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-live" : h.status === "revoked" ? "bg-destructive" : "bg-muted-foreground"
                      }`}
                    />
                    <h2 className="font-display text-lg font-semibold">{agent?.name ?? "Unknown agent"}</h2>
                    {agent && (
                      <Badge
                        variant={categoryBadgeVariant(agent.category)}
                        className="hidden sm:inline-flex"
                      >
                        {categoryLabel(agent.category)}
                      </Badge>
                    )}
                    <Badge variant={statusVariant}>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-live" />}
                      {h.status}
                    </Badge>
                    {h.verification === "unavailable" && (
                      <Badge variant="warn">Keystore unavailable</Badge>
                    )}
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
                    {isActive && (
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={isRevoking}
                        onClick={() => setPendingRevoke(h)}
                      >
                        {isRevoking ? <Loader2 className="animate-spin" /> : <ShieldOff />}
                        {isRevoking ? "Revoking..." : "Revoke onchain"}
                      </Button>
                    )}
                  </div>
                </header>

                <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.2fr_1fr]">
                  <div className="space-y-5">
                    <dl className="grid gap-3 text-xs sm:grid-cols-2">
                      <Field k="Daily limit" v={`${h.spendCap.toLocaleString("en-US")} test $U`} />
                      <Field k="State" v={isActive ? `expires in ${h.expiresIn}` : "permission ended"} />
                      <Field k="Session key" v={shortAddress(h.sessionKeyAddress)} />
                      <Field k="Granted" v={h.createdAt} />
                      <Field k="Allowlist" v={`${agent?.allowlist.length ?? 0} contracts`} />
                      <Field k="ERC-8183 job" v={h.erc8183JobId ?? "confirmed"} />
                    </dl>
                    <TransactionTimeline status={h.status} />
                  </div>

                  <div className="panel-inset p-4">
                    <p className="text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
                      Onchain proof
                    </p>
                    <div className="mt-3 space-y-3">
                      {h.keystoreTxHash && (
                        <TxRow label="Keystore registration" hash={h.keystoreTxHash} />
                      )}
                      <TxRow label="ERC-8183 hire" hash={h.erc8183TxHash} />
                      {h.revokeTxHash && <TxRow label="Session revoke" hash={h.revokeTxHash} />}
                    </div>
                  </div>
                </div>
                {h.status === "revoked" && h.revokeTxHash && (
                  <div className="mx-6 mb-6 flex flex-col gap-3 rounded-lg border border-live/30 bg-live/8 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-live/15 text-live">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">Session revoked onchain</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">This permission can no longer authorize calls from the agent.</p>
                      </div>
                    </div>
                    <ProofLink label="Open revoke proof" hash={h.revokeTxHash} />
                  </div>
                )}
              </article>
            </Reveal>
          );
        })}
      </div>

      <AlertDialog
        open={pendingRevoke !== null}
        onOpenChange={(open) => {
          if (!open) setPendingRevoke(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke this session onchain?</AlertDialogTitle>
            <AlertDialogDescription>
              The session key for{" "}
              <span className="font-semibold text-foreground">
                {pendingRevoke?.agent?.name ?? "this agent"}
              </span>{" "}
              will be invalidated in the Altana Keystore. The revoke transaction is final and
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingRevoke(null)}>
              Keep session
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pendingRevoke;
                setPendingRevoke(null);
                if (target) revoke(target.id);
              }}
            >
              <ShieldOff />
              Revoke onchain
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Shell>
  );
}

function NotConnected({ onConnect, opening }: { onConnect: () => void; opening: boolean }) {
  const assurances = [
    "Loading the ledger does not sign a transaction",
    "Your passkey recovers the same smart wallet",
    "Only you can approve an onchain revoke",
  ];

  return (
    <div className="panel grid overflow-hidden lg:grid-cols-[1.1fr_0.9fr]">
      <div className="p-8 sm:p-12">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-brass/10 text-brass">
          <Wallet className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="mt-6 text-2xl font-semibold text-foreground">Open your permission ledger</p>
        <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
          Recover your Altana smart wallet to inspect active, expired, and revoked sessions in one place.
        </p>
        <Button variant="brass" size="lg" className="mt-7" disabled={opening} onClick={onConnect}>
          {opening ? <Loader2 className="animate-spin" /> : <KeyRound />}
          {opening ? "Opening wallet" : "Open Altana wallet"}
        </Button>
      </div>
      <div className="flex items-center border-t border-border bg-panel p-8 sm:p-10 lg:border-t-0 lg:border-l">
        <ul className="w-full space-y-5">
          {assurances.map((assurance) => (
            <li key={assurance} className="flex items-start gap-3 text-sm leading-6 text-foreground/80">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-live/10 text-live">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
              </span>
              {assurance}
            </li>
          ))}
        </ul>
      </div>
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
      <dd className="num min-w-0 text-right text-foreground">{v}</dd>
    </div>
  );
}

function TxRow({ label, hash }: { label: string; hash: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="num mt-1 text-xs text-foreground">{shortAddress(hash)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <CopyButton value={hash} label={`Copy ${label} hash`} />
        <a
          href={`${EXPLORER}/tx/${hash}`}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${label} in BscScan`}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

function ProofLink({ label, hash }: { label: string; hash: string }) {
  return (
    <Button variant="steel" size="sm" asChild>
      <a href={`${EXPLORER}/tx/${hash}`} target="_blank" rel="noreferrer">
        {label}
        <ArrowUpRight />
      </a>
    </Button>
  );
}

function TransactionTimeline({ status }: { status: HireWithLive["status"] }) {
  const steps = [
    { label: "Wallet funded", complete: true },
    { label: "$U claimed", complete: true },
    { label: "Session active", complete: status === "active" },
    { label: "Job funded", complete: status !== "revoked" },
  ];

  if (status === "revoked") {
    steps[2] = { label: "Session revoked", complete: true };
    steps[3] = { label: "Job funded", complete: true };
  }

  return (
    <div className="rounded-lg border border-border bg-panel px-3 py-3">
      <p className="text-[10px] tracking-[0.14em] text-muted-foreground uppercase">Transaction path</p>
      <ol className="mt-3 grid gap-2 sm:grid-cols-4">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-2 text-[11px] text-foreground/85">
            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full ${step.complete ? "bg-live/15 text-live" : "bg-muted text-muted-foreground"}`}>
              {step.complete ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : <span className="h-1 w-1 rounded-full bg-current" />}
            </span>
            {step.label}
          </li>
        ))}
      </ol>
    </div>
  );
}
