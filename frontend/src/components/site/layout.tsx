"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ChevronRight, Menu, Terminal, Wallet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-brass-gradient text-primary-foreground transition-transform duration-500 ease-instrument group-hover:rotate-6">
        <Terminal className="h-4 w-4" strokeWidth={2.6} />
      </span>
      <span className="font-display text-[19px] font-extrabold tracking-tight">AgentDesk</span>
    </Link>
  );
}

const navLinkClass =
  "rounded-full px-3.5 py-2 text-foreground/70 transition-colors duration-300 hover:bg-accent hover:text-foreground";

export function AnnouncementBar() {
  return (
    <Link
      href={{ pathname: "/", hash: "marketplace" }}
      className="group flex items-center justify-center gap-2 border-b border-border bg-panel px-5 py-2.5 text-center text-[13px] font-semibold"
    >
      <span className="text-brass">NEW</span>
      <span className="text-foreground/80">
        Scoped session keys are live. Hire an agent with a cap you set.
      </span>
      <ChevronRight className="h-3.5 w-3.5 transition-transform duration-300 ease-instrument group-hover:translate-x-1" />
    </Link>
  );
}

function ConnectWalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;
        return (
          <Button
            variant={connected ? "outline" : "brass"}
            size="sm"
            className={connected ? "num" : ""}
            disabled={!ready}
            onClick={connected ? openAccountModal : openConnectModal}
          >
            <Wallet />
            {connected ? account.displayName : "Connect wallet"}
          </Button>
        );
      }}
    </ConnectButton.Custom>
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
            <Link
              href="/"
              className={cn(navLinkClass, pathname === "/" && "text-foreground")}
            >
              Marketplace
            </Link>
            <Link
              href="/dashboard"
              className={cn(navLinkClass, pathname === "/dashboard" && "text-foreground")}
            >
              Dashboard
            </Link>
            <Link href={{ pathname: "/", hash: "how-it-works" }} className={navLinkClass}>
              How it works
            </Link>
            <Link href={{ pathname: "/", hash: "pricing" }} className={navLinkClass}>
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="num hidden items-center gap-2 rounded-full border border-border px-3 py-1.5 text-[11px] text-muted-foreground lg:inline-flex">
            <span className="pulse-live h-1.5 w-1.5 rounded-full bg-live" />
            BSC TESTNET
          </span>
          <ConnectWalletButton />
          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            className="grid h-10 w-10 cursor-pointer place-items-center rounded-full border border-border text-foreground/80 transition-colors duration-300 hover:bg-accent md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-border bg-background px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1 text-[15px] font-semibold">
            <MobileLink href="/" onNavigate={closeMenu}>
              Marketplace
            </MobileLink>
            <MobileLink href="/dashboard" onNavigate={closeMenu}>
              Dashboard
            </MobileLink>
            <MobileLink href={{ pathname: "/", hash: "how-it-works" }} onNavigate={closeMenu}>
              How it works
            </MobileLink>
            <MobileLink href={{ pathname: "/", hash: "pricing" }} onNavigate={closeMenu}>
              Pricing
            </MobileLink>
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
  href: string | { pathname: string; hash?: string };
  onNavigate: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="cursor-pointer rounded-lg px-3 py-2.5 text-foreground/75 transition-colors duration-300 hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-panel">
      <div className="mx-auto max-w-[1240px] px-5 pt-16">
        <div className="panel flex flex-col items-center gap-5 p-10 text-center shadow-panel sm:p-12">
          <h2 className="max-w-xl text-2xl font-extrabold sm:text-4xl">
            Put an agent to work in minutes
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Free to browse. No wallet approval until you set a cap and an expiry.
          </p>
          <Button variant="brass" size="xl" asChild>
            <Link href={{ pathname: "/", hash: "marketplace" }}>
              Get started, it is free
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
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
          items={["Marketplace", "Agent detail", "Permissions dashboard", "Session keys"]}
        />
        <FooterColumn
          title="Protocol"
          items={["ERC-8004 registry", "ERC-8183 hiring", "Altana Keystore", "BSC testnet"]}
        />
        <FooterColumn title="Resources" items={["Docs", "Architecture", "Security", "Status"]} />
      </div>
      <div className="mx-auto flex max-w-[1240px] flex-col gap-2 border-t border-border px-5 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="num">AgentDesk, built for BNB Chain Build the Era</span>
        <span className="num">Testnet demo data, no real funds at risk</span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-[12px] font-bold tracking-[0.12em] text-muted-foreground uppercase">
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((i) => (
          <li key={i}>
            <span className="cursor-default text-foreground/75 transition-colors duration-300 hover:text-brass">
              {i}
            </span>
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