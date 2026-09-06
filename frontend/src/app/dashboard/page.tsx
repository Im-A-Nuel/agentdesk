"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowUpRight, KeyRound, Loader2, RefreshCw, ShieldOff, Wallet } from "lucide-react";
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
    try {
      const wallet = await openAltanaWallet();
      setAddress(wallet.address);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open Altana wallet");
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
              <div className="panel mt-10 grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 sm:divide-x">
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
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1240px] space-y-5 px-5 py-14">
        {!isConnected && <NotConnected onConnect={connectAltana} />}

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
            <Reveal key={h.id} delay={i * 80}>
              <article
                className={`panel overflow-hidden transition-shadow duration-300 ${
                  isActive ? "shadow-panel" : ""
                }`}
              >
                <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isActive ? "bg-live" : "bg-destructive"
                      }`}
                    />
                    <h2 className="font-display text-lg font-semibold">{agent?.name}</h2>
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
                      onClick={() => setPendingRevoke(h)}
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
                    <dl className="grid gap-3 text-xs sm:grid-cols-2">
                      <Field k="Spend cap" v={`${h.spendCap.toLocaleString("en-US")} test $U`} />
                      <Field k="State" v={isActive ? `expires in ${h.expiresIn}` : "permission ended"} />
                      <Field k="Session key" v={shortAddress(h.sessionKeyAddress)} />
                      <Field k="Granted" v={h.createdAt} />
                      <Field k="Allowlist" v={`${agent?.allowlist.length ?? 0} contracts`} />
                      <Field k="ERC-8183 job" v={h.erc8183JobId ?? "confirmed"} />
                    </dl>
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

function NotConnected({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="panel p-12 text-center">
      <Wallet className="mx-auto h-6 w-6 text-brass" />
      <p className="mt-4 text-base font-semibold text-foreground">Open your Altana wallet</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        Your passkey recovers the same smart wallet address. Reading the dashboard does not move
        funds or change a session.
      </p>
      <Button variant="brass" size="lg" className="mt-6" onClick={onConnect}>
        <KeyRound />
        Open Altana wallet
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
      <p className="num mt-1 flex items-start gap-2 text-[10px] break-all text-foreground/85">
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
