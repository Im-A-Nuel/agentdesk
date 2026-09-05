"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      aria-label={label ?? "Copy to clipboard"}
      className="inline-flex cursor-pointer text-muted-foreground transition-colors duration-300 hover:text-brass"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copied to clipboard");
          window.setTimeout(() => setCopied(false), 1500);
        } catch {
          toast.error("Could not copy");
        }
      }}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-live" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}