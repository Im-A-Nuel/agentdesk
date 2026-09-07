export type CategoryId = "rebalancing" | "grid_trading" | "yield" | "health_factor";
export type AllowlistEntry = { label: string; address: string; symbol?: string };
export type Agent = {
  id: string; name: string; operator: string; address: string; category: CategoryId;
  tagline: string; description: string; reputation: number; jobs: number; volumeUsd: number;
  successRate: number; feeBps: number; medianRuntime: string; allowlist: AllowlistEntry[];
  capabilities: string[]; activity: { label: string; value: string }[]; registeredAt: string;
  sourceSyncedAt?: string;
};
export const categories: { id: CategoryId; label: string; blurb: string }[] = [
  { id: "rebalancing", label: "Rebalancing", blurb: "Agents discovered with the rebalancing semantic query." },
  { id: "grid_trading", label: "Grid Trading", blurb: "Agents discovered with the grid trading semantic query." },
  { id: "yield", label: "Yield Optimisation", blurb: "Agents discovered with the yield optimization semantic query." },
  { id: "health_factor", label: "Health Factor", blurb: "Agents discovered with the health factor monitoring semantic query." },
];
export const categoryLabel = (id: CategoryId) => categories.find((category) => category.id === id)?.label ?? id;
export type CategoryBadgeVariant = "sky" | "default" | "success" | "warn";
export function categoryBadgeVariant(id: CategoryId): CategoryBadgeVariant {
  const variants: Record<CategoryId, CategoryBadgeVariant> = { rebalancing: "sky", grid_trading: "default", yield: "success", health_factor: "warn" };
  return variants[id];
}
export function categoryDotClass(id: CategoryId): string {
  const classes: Record<CategoryId, string> = { rebalancing: "bg-sky", grid_trading: "bg-brass", yield: "bg-live", health_factor: "bg-warn" };
  return classes[id];
}
export const shortAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;
