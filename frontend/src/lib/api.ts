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

const REQUEST_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === "AbortError";
    throw new ApiError(
      "NETWORK",
      timedOut
        ? "The request timed out. Check your connection and try again."
        : "Network error. Check your connection and try again.",
    );
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    let code = "HTTP";
    let message = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: { code?: string; message?: string } };
      if (body?.error) {
        code = body.error.code ?? code;
        message = body.error.message ?? message;
      }
    } catch {
      // keep the defaults
    }
    throw new ApiError(code, message);
  }

  return res.json() as Promise<T>;
}

export function getAgents(category?: string): Promise<{ agents: Agent[] }> {
  const q = category && category !== "all" ? `?category=${encodeURIComponent(category)}` : "";
  return request(`/api/agents${q}`);
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