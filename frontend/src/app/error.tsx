"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="num text-[11px] tracking-[0.18em] text-brass uppercase">AgentDesk</p>
      <h1 className="mt-4 text-2xl font-extrabold text-foreground">This page did not load</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
        Something went wrong on our end. Try again, or head back to the marketplace.
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button variant="brass" size="lg" onClick={reset}>
          <RefreshCw />
          Try again
        </Button>
        <Button variant="steel" size="lg" asChild>
          <a href="/">Go to marketplace</a>
        </Button>
      </div>
    </div>
  );
}