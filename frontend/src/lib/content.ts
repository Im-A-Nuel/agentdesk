import {
  Check,
  Coins,
  Fingerprint,
  KeyRound,
  Layers,
  Search,
  ShieldOff,
  Timer,
  type LucideIcon,
} from "lucide-react";

export type ContentItem = { icon: LucideIcon; title: string; body: string };

export const triad: ContentItem[] = [
  {
    icon: Coins,
    title: "Spend cap",
    body: "Every session carries a hard notional ceiling. When the cap is reached the key stops signing, no top up happens silently.",
  },
  {
    icon: Layers,
    title: "Contract allowlist",
    body: "An agent can only touch the contracts you approve at hire time. Anything outside the list reverts at the keystore level.",
  },
  {
    icon: Timer,
    title: "Expiry",
    body: "Permissions end on a date you choose. There is no unlimited option anywhere in the flow, by design.",
  },
];

export type Step = { n: string; icon: LucideIcon; title: string; body: string };

export const steps: Step[] = [
  {
    n: "01",
    icon: Search,
    title: "Discover",
    body: "Browse agents pulled from the ERC-8004 registry across four categories, with reputation and recent activity attached.",
  },
  {
    n: "02",
    icon: Fingerprint,
    title: "Review terms",
    body: "Read what the agent actually does, the venues it needs, its fee, and the exact permissions it is asking for.",
  },
  {
    n: "03",
    icon: KeyRound,
    title: "Grant a session",
    body: "Set your cap and duration. A scoped session key is created and registered in the Altana Keystore, then the hire executes via ERC-8183.",
  },
  {
    n: "04",
    icon: ShieldOff,
    title: "Revoke anytime",
    body: "Your dashboard reads live keystore state. Revoke takes effect onchain immediately, no support ticket involved.",
  },
];

export type Plan = {
  name: string;
  price: string;
  note: string;
  body: string;
  items: string[];
  cta: string;
  featured: boolean;
};

export const plans: Plan[] = [
  {
    name: "Browse",
    price: "Free",
    note: "forever",
    body: "Full registry discovery and agent terms.",
    items: ["Search all categories", "Reputation and activity", "Public keystore reads"],
    cta: "Start browsing",
    featured: false,
  },
  {
    name: "Hire",
    price: "0.15%",
    note: "of capped notional",
    body: "Scoped session keys with onchain enforcement.",
    items: ["Spend cap and expiry", "Contract allowlist", "Instant onchain revoke", "Live dashboard"],
    cta: "Hire an agent",
    featured: true,
  },
  {
    name: "Desk",
    price: "Custom",
    note: "for teams",
    body: "Multi signer policies for treasuries.",
    items: ["Shared permission policies", "Role based approvals", "Audit exports", "Priority support"],
    cta: "Talk to us",
    featured: false,
  },
];

export type Faq = { q: string; a: string };

export const faqs: Faq[] = [
  {
    q: "What exactly does an agent get access to?",
    a: "Only the contracts on your allowlist, only up to your spend cap, and only until your expiry date. The session key cannot sign anything outside those bounds.",
  },
  {
    q: "Can I cancel after hiring?",
    a: "Yes. Revoke from the dashboard and the keystore entry is invalidated onchain in the same transaction, so the agent loses authority immediately.",
  },
  {
    q: "Where does the agent data come from?",
    a: "Identity, reputation, and activity are read from the ERC-8004 registry through 8004scan, so the numbers on a card match the chain.",
  },
  {
    q: "Do I need to fund a new wallet?",
    a: "No. You keep your own wallet and grant a scoped session instead of moving funds or approving unlimited spend.",
  },
];

export const planCheck = Check;