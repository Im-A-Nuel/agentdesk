import type { Agent } from "./agents";

export type HireWithLive = {
  id: string;
  agentId: string;
  sessionKeyAddress: string;
  keystoreTxHash: string;
  erc8183TxHash: string;
  spendCap: number;
  spent: number;
  status: "active" | "revoked" | "expired";
  createdAt: string;
  expiresIn: string;
};

export type HireResult = HireWithLive;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { message?: string } };
      message = body.error?.message ?? message;
    } catch {
      // keep the default message
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export function getAgents(category?: string): Promise<{ agents: Agent[] }> {
  const q = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
  return request(`/api/agents${q}`);
}

export function getAgentById(id: string): Promise<{ agent: Agent }> {
  return request(`/api/agents/${encodeURIComponent(id)}`);
}

export function getMyHires(wallet: string): Promise<{ hires: HireWithLive[] }> {
  return request(`/api/hire/mine?wallet=${encodeURIComponent(wallet)}`);
}

export function createHire(body: {
  agentId: string;
  spendCap: number;
  durationSeconds: number;
  userWallet: string;
}): Promise<{ hire: HireResult }> {
  return request("/api/hire", { method: "POST", body: JSON.stringify(body) });
}

export function revokeHire(id: string, userWallet: string): Promise<{ revokeTxHash: string }> {
  return request(`/api/hire/${encodeURIComponent(id)}/revoke`, {
    method: "POST",
    body: JSON.stringify({ userWallet }),
  });
}