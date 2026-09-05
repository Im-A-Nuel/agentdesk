export type CategoryId = "rebalancing" | "grid_trading" | "yield" | "health_factor";

export type AllowlistEntry = {
  label: string;
  address: string;
  symbol?: string;
};

export type Agent = {
  id: string;
  name: string;
  operator: string;
  address: string;
  category: CategoryId;
  tagline: string;
  description: string;
  reputation: number;
  jobs: number;
  volumeUsd: number;
  successRate: number;
  feeBps: number;
  medianRuntime: string;
  allowlist: AllowlistEntry[];
  capabilities: string[];
  activity: { label: string; value: string }[];
  registeredAt: string;
};

export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  {
    id: "rebalancing",
    label: "Rebalancing",
    blurb: "Keep portfolio weights inside a target band without manual swaps.",
  },
  {
    id: "grid_trading",
    label: "Grid Trading",
    blurb: "Ladder buy and sell orders across a defined price range.",
  },
  {
    id: "yield",
    label: "Yield Optimisation",
    blurb: "Move idle liquidity toward the best risk adjusted venue.",
  },
  {
    id: "health_factor",
    label: "Health Factor",
    blurb: "Watch lending positions and defend them before liquidation.",
  },
];

export const categoryLabel = (id: CategoryId) =>
  categories.find((c) => c.id === id)?.label ?? id;

export type CategoryBadgeVariant = "sky" | "default" | "success" | "warn";

export function categoryBadgeVariant(id: CategoryId): CategoryBadgeVariant {
  switch (id) {
    case "rebalancing":
      return "sky";
    case "grid_trading":
      return "default";
    case "yield":
      return "success";
    case "health_factor":
      return "warn";
  }
}

export function categoryDotClass(id: CategoryId): string {
  switch (id) {
    case "rebalancing":
      return "bg-sky";
    case "grid_trading":
      return "bg-brass";
    case "yield":
      return "bg-live";
    case "health_factor":
      return "bg-warn";
  }
}

const pancake: AllowlistEntry = { label: "PancakeSwap Router v3", address: "0x1b81D678ffb9C0263b24A97847620C99d213eB14" };
const venus: AllowlistEntry = { label: "Venus Comptroller", address: "0xfD36E2c2a6789Db23113685031d7F16329158384" };
const wbnb: AllowlistEntry = { label: "WBNB", address: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", symbol: "WBNB" };
const usdt: AllowlistEntry = { label: "USDT", address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT" };

export const agents: Agent[] = [
  {
    id: "helios-band",
    name: "Helios Band",
    operator: "Helios Labs",
    address: "0x7A3f9C21bE4d5A08cF13e2b7d5A9c8E4F10b2D63",
    category: "rebalancing",
    tagline: "Threshold rebalancer for two and three asset books",
    description:
      "Helios Band holds a target allocation inside a tolerance band and only trades when drift breaks the band. Every route is quoted against two venues before execution, and the agent refuses any swap that would exceed the spend cap left on its session key.",
    reputation: 92,
    jobs: 4128,
    volumeUsd: 18_400_000,
    successRate: 99.2,
    feeBps: 12,
    medianRuntime: "38s",
    allowlist: [pancake, wbnb, usdt],
    capabilities: [
      "Drift band from 0.5 to 10 percent",
      "Two venue price check before every route",
      "Skips execution when gas exceeds expected gain",
      "Writes a signed run receipt per rebalance",
    ],
    activity: [
      { label: "Runs, 7 days", value: "312" },
      { label: "Median drift corrected", value: "1.8%" },
      { label: "Reverted runs", value: "2" },
    ],
    registeredAt: "2025-11-04",
  },
  {
    id: "ferrum-grid",
    name: "Ferrum Grid",
    operator: "Ferrum Systems",
    address: "0xC41b8De9f0A72c5d3E86b41aB7cD0F19e5B34a72",
    category: "grid_trading",
    tagline: "Range grid execution with inventory guardrails",
    description:
      "Ferrum Grid places a symmetric ladder across a price range you define and rotates inventory as levels fill. It halts and reports when price closes outside the range for longer than your configured tolerance instead of chasing the move.",
    reputation: 88,
    jobs: 9640,
    volumeUsd: 42_100_000,
    successRate: 98.4,
    feeBps: 18,
    medianRuntime: "11s",
    allowlist: [pancake, usdt, wbnb],
    capabilities: [
      "Up to 40 grid levels per range",
      "Inventory skew limits per side",
      "Automatic halt on range breakout",
      "Per level fill log with tx hashes",
    ],
    activity: [
      { label: "Fills, 7 days", value: "2,844" },
      { label: "Range breakout halts", value: "6" },
      { label: "Average spread captured", value: "0.31%" },
    ],
    registeredAt: "2025-09-19",
  },
  {
    id: "meridian-yield",
    name: "Meridian Yield",
    operator: "Meridian Research",
    address: "0x9Ee2B7401aC58d63fA0b2E7d84C1a5F63dB0917C",
    category: "yield",
    tagline: "Risk weighted allocator across lending venues",
    description:
      "Meridian Yield scores lending and liquidity venues on rate, depth, and utilisation, then moves capital only when the improvement clears its own switching cost. Venue scores and the reason for each move are published with the run receipt.",
    reputation: 95,
    jobs: 2317,
    volumeUsd: 61_700_000,
    successRate: 99.6,
    feeBps: 25,
    medianRuntime: "52s",
    allowlist: [venus, usdt, pancake],
    capabilities: [
      "Venue scoring on rate, depth, utilisation",
      "Switching cost floor before any move",
      "Per venue exposure ceiling",
      "Published rationale per allocation",
    ],
    activity: [
      { label: "Reallocations, 7 days", value: "41" },
      { label: "Net rate improvement", value: "+1.74%" },
      { label: "Venues monitored", value: "9" },
    ],
    registeredAt: "2025-08-02",
  },
  {
    id: "aegis-hf",
    name: "Aegis Health",
    operator: "Aegis Guard",
    address: "0x2Fd7A6c93b410E58Dc6a17bE9f0C238a4B71dE05",
    category: "health_factor",
    tagline: "Liquidation defence for lending positions",
    description:
      "Aegis Health watches the health factor of your lending positions and acts at your chosen trigger by repaying debt or topping up collateral. It cannot open new positions, and its allowlist is limited to the money market you approve.",
    reputation: 97,
    jobs: 1584,
    volumeUsd: 9_300_000,
    successRate: 99.9,
    feeBps: 20,
    medianRuntime: "9s",
    allowlist: [venus, usdt],
    capabilities: [
      "Trigger anywhere between 1.05 and 2.0",
      "Repay first, collateral top up second",
      "Cannot open or increase leverage",
      "Alert receipt on every intervention",
    ],
    activity: [
      { label: "Interventions, 7 days", value: "27" },
      { label: "Positions defended", value: "412" },
      { label: "Liquidations allowed", value: "0" },
    ],
    registeredAt: "2025-10-11",
  },
  {
    id: "quartz-band",
    name: "Quartz Drift",
    operator: "Quartz Compute",
    address: "0x51aC7f0dE9b34c8A2d76bF15e0C93A8d2F64bB17",
    category: "rebalancing",
    tagline: "Calendar rebalancer with slippage ceiling",
    description:
      "Quartz Drift rebalances on a fixed schedule rather than on drift, which suits books that want predictable turnover. Each leg is aborted if realised slippage would pass the ceiling you set at hire time.",
    reputation: 84,
    jobs: 3105,
    volumeUsd: 7_900_000,
    successRate: 97.8,
    feeBps: 9,
    medianRuntime: "44s",
    allowlist: [pancake, wbnb],
    capabilities: [
      "Daily, weekly, or monthly cadence",
      "Hard slippage ceiling per leg",
      "Partial fills allowed with report",
      "Dry run mode before first live pass",
    ],
    activity: [
      { label: "Runs, 7 days", value: "88" },
      { label: "Aborted legs", value: "5" },
      { label: "Average turnover", value: "3.2%" },
    ],
    registeredAt: "2025-12-01",
  },
  {
    id: "obsidian-grid",
    name: "Obsidian Ladder",
    operator: "Obsidian Desk",
    address: "0xE0b1D74aF9c2358bD617e4Aa0C93F851bD27a64F",
    category: "grid_trading",
    tagline: "Volatility scaled grid for majors",
    description:
      "Obsidian Ladder widens and tightens its grid spacing with realised volatility so level density tracks the market instead of a static assumption. Position size per level is always bounded by the session spend cap.",
    reputation: 81,
    jobs: 6420,
    volumeUsd: 23_500_000,
    successRate: 96.9,
    feeBps: 22,
    medianRuntime: "13s",
    allowlist: [pancake, wbnb, usdt],
    capabilities: [
      "Spacing scaled to realised volatility",
      "Per level notional ceiling",
      "Daily loss limit with auto stop",
      "Fill ledger exportable as CSV",
    ],
    activity: [
      { label: "Fills, 7 days", value: "1,905" },
      { label: "Auto stops triggered", value: "1" },
      { label: "Average level spacing", value: "0.42%" },
    ],
    registeredAt: "2025-07-23",
  },
];

export const getAgent = (id: string) => agents.find((a) => a.id === id);

export type Hire = {
  id: string;
  agentId: string;
  sessionKey: string;
  keystoreTx: string;
  hireTx: string;
  spendCap: number;
  spent: number;
  expiresIn: string;
  status: "active" | "revoked" | "expired";
  createdAt: string;
};

export const hires: Hire[] = [
  {
    id: "hire-01",
    agentId: "helios-band",
    sessionKey: "0x8Bc4Ae21fD09b7C3e5A0d61Bf74C2a09E3b1D845",
    keystoreTx: "0x3f9a2c74be015d8a6cf42b71e09d3a5c81b7f26d4a0e93c5187bd6f204ac31e9b",
    hireTx: "0xa71c04ef52b9d386014c7fa2be95d073c184afb62e0d95713bc48f2a06de51c7",
    spendCap: 5000,
    spent: 1840,
    expiresIn: "12d 04h",
    status: "active",
    createdAt: "2026-08-24",
  },
  {
    id: "hire-02",
    agentId: "aegis-hf",
    sessionKey: "0x41Fa9b03cE72d185aB60f4c2D97e35B0a8C61d29",
    keystoreTx: "0xc82d61a475fe03b9d1275ea640cb38f92d5a71e0b4c96d38f1027ae5b63c4d81",
    hireTx: "0x59be13c0da72f486b3915de20c74a8f16b0d35e9c8241af7062db95431fe7a0c",
    spendCap: 2000,
    spent: 310,
    expiresIn: "27d 19h",
    status: "active",
    createdAt: "2026-08-29",
  },
  {
    id: "hire-03",
    agentId: "ferrum-grid",
    sessionKey: "0xB60d18Ae42f0c795D138ab6E20cF41d9a3B750Ce",
    keystoreTx: "0x1de74b0a962c5f38ab417d0e25c9b6f3810da457e2b096cf7413a8d520fe6b93",
    hireTx: "0x7c0badf1935e26a4c810fb742de05193ca6b84f0d217e953b8c460ad1f27e6b5",
    spendCap: 10000,
    spent: 10000,
    expiresIn: "revoked",
    status: "revoked",
    createdAt: "2026-08-11",
  },
];

export const shortAddress = (address: string) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const usd = (value: number) =>
  value >= 1_000_000
    ? `$${(value / 1_000_000).toFixed(1)}M`
    : value >= 1_000
      ? `$${(value / 1_000).toFixed(1)}K`
      : `$${value}`;
