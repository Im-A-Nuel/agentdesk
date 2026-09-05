import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Token icons as inline SVG marks on brand-color tiles, so they always render (no external
// CDN), stay consistent across the app, and are recognizable for the common BSC tokens.
// Non-token contracts get a neutral "contract" glyph instead of a token icon.

type TokenIconProps = {
  symbol?: string;
  className?: string;
};

function BnbMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#F3BA2F" d="M12 2 20.5 8.5 16.6 12 12 8.2 7.4 12 3.5 8.5Z" />
      <path fill="#F3BA2F" d="M12 22 3.5 15.5 7.4 12 12 15.8 16.6 12 20.5 15.5Z" />
      <path fill="#F3BA2F" d="M12 5.3 15.9 8.5 12 11.7 8.1 8.5Z" />
    </svg>
  );
}

function TextMark({ char, fill = "#ffffff" }: { char: string; fill?: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[58%] w-[58%]" aria-hidden="true">
      <text
        x="12"
        y="17.5"
        textAnchor="middle"
        fontSize="17"
        fontWeight="700"
        fill={fill}
        style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
      >
        {char}
      </text>
    </svg>
  );
}

function ContractMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M7 2.5h7l3.5 3.5V21.5H7Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M14 2.5v3.5h3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 12.5h5M10 15.5h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

const TOKEN_MARKS: Record<string, { bg: string; node: ReactNode }> = {
  USDT: { bg: "#50AF95", node: <TextMark char="₮" /> },
  USDC: { bg: "#2775CA", node: <TextMark char="$" /> },
  BNB: { bg: "#181A20", node: <BnbMark className="h-[72%] w-[72%]" /> },
  WBNB: { bg: "#181A20", node: <BnbMark className="h-[72%] w-[72%]" /> },
};

export function TokenIcon({ symbol, className }: TokenIconProps) {
  const tileClass = cn("grid shrink-0 place-items-center overflow-hidden rounded-lg", className);

  const mark = symbol ? TOKEN_MARKS[symbol] : undefined;
  if (mark) {
    return (
      <span className={tileClass} style={{ background: mark.bg }} title={symbol} aria-label={symbol}>
        {mark.node}
      </span>
    );
  }

  if (symbol) {
    return (
      <span
        className={cn(tileClass, "num bg-panel text-brass")}
        title={symbol}
        aria-label={symbol}
      >
        <span className="text-[0.62em] font-bold">{symbol.slice(0, 1)}</span>
      </span>
    );
  }

  return (
    <span className={cn(tileClass, "bg-panel text-brass")} title="Contract" aria-label="Contract">
      <ContractMark className="h-[58%] w-[58%]" />
    </span>
  );
}