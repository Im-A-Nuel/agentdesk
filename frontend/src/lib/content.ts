import { Coins, Fingerprint, KeyRound, Layers, Search, ShieldOff, Timer, type LucideIcon } from "lucide-react";
export type ContentItem = { icon: LucideIcon; title: string; body: string };
export const triad: ContentItem[] = [
  { icon: Coins, title: "Daily spend limit", body: "The session carries an explicit per-day test $U allowance. AgentDesk never asks for an unlimited approval." },
  { icon: Layers, title: "Contract allowlist", body: "The session policy names the BSC testnet contracts the agent may call. Other targets are outside its authority." },
  { icon: Timer, title: "Expiry", body: "The key expires after the duration you choose and can also be revoked early from the dashboard." },
];
export type Step = { n: string; icon: LucideIcon; title: string; body: string };
export const steps: Step[] = [
  { n: "01", icon: Search, title: "Discover", body: "Browse agent identity and reputation data synchronized from the ERC-8004 registry through 8004scan." },
  { n: "02", icon: Fingerprint, title: "Open a passkey wallet", body: "Create or recover an Altana smart wallet in the browser. Your passkey authorizes its testnet transactions." },
  { n: "03", icon: KeyRound, title: "Grant and fund", body: "Register a scoped session in the Altana Keystore, then fund a 0.1 test $U ERC-8183 job." },
  { n: "04", icon: ShieldOff, title: "Verify or revoke", body: "Open both transaction hashes in BscScan and revoke the session onchain whenever you choose." },
];
export type Faq = { q: string; a: string };
export const faqs: Faq[] = [
  { q: "Is this mainnet?", a: "No. The current application uses BNB Smart Chain testnet, test BNB for gas, and Altana test $U." },
  { q: "Does the agent execute automatically?", a: "No. This prototype creates the scoped session and funds the ERC-8183 job, but it does not transmit the private session signer to the provider or run settlement." },
  { q: "Where does agent data come from?", a: "The synchronization job queries 8004scan for ERC-8004 agents on chain ID 97 and stores the normalized results in Neon." },
  { q: "Can I revoke access?", a: "Yes. The dashboard submits an Altana Keystore revoke transaction and records it only after onchain confirmation." },
];
