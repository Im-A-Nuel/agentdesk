"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { ChevronRight, KeyRound, Loader2, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/site/brand-mark";
import { openAltanaWallet, storedAltanaWalletAddress } from "@/lib/altana-client";
import { shortAddress } from "@/lib/agents";
import { cn } from "@/lib/utils";

export function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-8 w-8 place-items-center overflow-hidden rounded-xl transition-transform duration-500 ease-instrument group-hover:rotate-6">
        <BrandMark className="h-full w-full" />
      </span>
      <span className="font-display text-[19px] font-extrabold tracking-tight">AgentDesk</span>
    </Link>
  );
}

const navLinkClass =
  "rounded-md px-3.5 py-2 text-foreground/85 transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function AnnouncementBar() {
  return (
    <Link
      href="/marketplace"
      className="group flex items-center justify-center gap-2 border-b border-border bg-panel px-5 py-2.5 text-center text-[13px] font-semibold"
    >
      <span className="text-foreground/85">
        BSC testnet prototype. Transactions use test tokens only.
      </span>
      <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 ease-instrument group-hover:translate-x-1" />
    </Link>
  );
}

const nav = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
];

function ConnectWalletButton() {
  const [address, setAddress] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    setAddress(storedAltanaWalletAddress());
  }, []);

  const openWallet = async () => {
    setOpening(true);
    try {
      const wallet = await openAltanaWallet();
      setAddress(wallet.address);
      toast.success("Altana wallet ready");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not open Altana wallet");
    } finally {
      setOpening(false);
    }
  };

  return (
    <Button
      variant={address ? "outline" : "brass"}
      size="sm"
      className={address ? "num" : ""}
      disabled={opening}
      onClick={openWallet}
    >
      {opening ? <Loader2 className="animate-spin" /> : <KeyRound />}
      {opening ? "Opening" : address ? shortAddress(address) : "Altana wallet"}
    </Button>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500 ease-instrument",
        scrolled
          ? "border-border bg-background/90 shadow-panel backdrop-blur-xl"
          : "border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1240px] items-center justify-between px-5">
        <div className="flex items-center gap-9">
          <Wordmark />
          <nav className="hidden items-center gap-1 text-[14px] font-semibold md:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(navLinkClass, pathname === n.href && "text-foreground")}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="num hidden items-center gap-2 rounded-md border border-border px-3 py-1.5 text-[11px] text-muted-foreground lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-live" />
            BSC TESTNET
          </span>
          <ConnectWalletButton />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-lg border border-border text-foreground/85 transition-colors duration-200 hover:bg-accent md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-[15px] font-semibold">
            {nav.map((n) => (
              <MobileLink key={n.href} href={n.href} onNavigate={closeMenu}>
                {n.label}
              </MobileLink>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

function MobileLink({
  href,
  onNavigate,
  children,
}: {
  href: string;
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="cursor-pointer rounded-lg px-3 py-2.5 text-foreground/85 transition-colors duration-300 hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-panel">
      <div className="mx-auto grid max-w-[1240px] gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Wordmark />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            The front door for agents registered on BNB Smart Chain, with scoped and revocable
            onchain permissions.
          </p>
        </div>
        <FooterColumn
          title="Product"
          items={[
            { label: "Marketplace", href: "/marketplace" },
            { label: "Agent detail", href: "/agent/helios-band" },
            { label: "Permissions dashboard", href: "/dashboard" },
            { label: "Session keys", href: "/how-it-works" },
          ]}
        />
        <FooterColumn
          title="Protocol"
          items={[
            { label: "ERC-8004 registry" },
            { label: "ERC-8183 hiring" },
            { label: "Altana Keystore" },
            { label: "BSC testnet" },
          ]}
        />
        <FooterColumn
          title="Resources"
          items={[
            { label: "How it works", href: "/how-it-works" },
            { label: "Pricing", href: "/pricing" },
            { label: "Dashboard", href: "/dashboard" },
          ]}
        />
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="num">AgentDesk, built for BNB Chain Build the Era</span>
        <span className="num">BSC testnet only · verify every hash on BscScan</span>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
}: {
  title: string;
  items: { label: string; href?: string }[];
}) {
  return (
    <div>
      <h3 className="text-[12px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i.label}>
            {i.href ? (
              <Link
                href={i.href}
                className="cursor-pointer text-foreground/85 transition-colors duration-300 hover:text-brass"
              >
                {i.label}
              </Link>
            ) : (
              <span className="cursor-default text-foreground/85 transition-colors duration-300 hover:text-brass">
                {i.label}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}
