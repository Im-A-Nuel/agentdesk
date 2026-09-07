"use client";

import { useEffect, useState } from "react";
import { Check, KeyRound } from "lucide-react";

import { BrandMark } from "@/components/site/brand-mark";

const introStorageKey = "agentdesk:landing-intro-seen";

export function LandingIntro() {
  const [show, setShow] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(introStorageKey)) {
      setShow(false);
      return;
    }

    window.sessionStorage.setItem(introStorageKey, "true");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const leaveTimer = window.setTimeout(() => setLeaving(true), reducedMotion ? 120 : 1500);
    const removeTimer = window.setTimeout(() => setShow(false), reducedMotion ? 180 : 1900);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <div className={`landing-intro ${leaving ? "landing-intro-leaving" : ""}`} role="status" aria-label="Loading AgentDesk">
      <div className="landing-intro-grid" aria-hidden="true" />
      <div className="landing-intro-content">
        <div className="landing-intro-mark-wrap" aria-hidden="true">
          <span className="landing-intro-ring landing-intro-ring-one" />
          <span className="landing-intro-ring landing-intro-ring-two" />
          <BrandMark className="landing-intro-mark" />
        </div>
        <div className="mt-8 text-center">
          <p className="num text-[10px] font-bold tracking-[0.28em] text-brass uppercase">AgentDesk</p>
          <p className="mt-3 text-xl font-semibold tracking-tight text-foreground">Preparing permission ledger</p>
        </div>
        <div className="landing-intro-progress mt-7" aria-hidden="true"><span /></div>
        <div className="mt-4 flex items-center justify-between gap-8 num text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><KeyRound className="h-3 w-3 text-brass" /> PASSKEY READY</span>
          <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-live" strokeWidth={3} /> BSC TESTNET</span>
        </div>
      </div>
    </div>
  );
}
