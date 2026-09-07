"use client";

import {
  BNB_TESTNET,
  createClient,
  ERC8183_ADDRESSES,
  hireErc8183Agent,
  type GrantSessionResult,
} from "@altananetwork/sdk";
import { encodeFunctionData, formatEther, parseEther, parseUnits, type Address, type Hex } from "viem";

import type { Agent } from "./agents";

const altana = createClient({ chains: [BNB_TESTNET] });
const walletStorageKey = "agentdesk:altana-wallet";
const orphanSessionStorageKey = "agentdesk:orphan-session";
const hireBudget = parseUnits("0.1", 18);
const nativeFeeAllowance = parseEther("0.02");
const walletChangeEvent = "agentdesk:wallet-change";

export type AltanaWallet = Awaited<ReturnType<typeof altana.createPasskeyWallet>>;

export type AltanaBalances = {
  native: string;
  nativeWei: string;
  paymentToken: string;
  paymentTokenRaw: string | null;
};

const U_FAUCET = "0x86e9197CC0F76E4e4aaa7082180945196bBAb5D3" as Address;

export type OnchainHireResult = {
  altanaWalletAddress: Address;
  sessionPublicKey: Hex;
  keystoreTxHash: Hex | null;
  erc8183TxHash: Hex;
  erc8183JobId: string;
  expiryAt: string;
};

export function storedOrphanSession(): Hex | null {
  const value = window.localStorage.getItem(orphanSessionStorageKey);
  return value && /^0x[a-fA-F0-9]+$/.test(value) ? (value as Hex) : null;
}

function relyingPartyId(): string {
  return window.location.hostname;
}

export function storedAltanaWalletAddress(): Address | null {
  const value = window.localStorage.getItem(walletStorageKey);
  return value && /^0x[a-fA-F0-9]{40}$/.test(value) ? (value as Address) : null;
}

export function clearStoredAltanaWallet() {
  window.localStorage.removeItem(walletStorageKey);
  window.dispatchEvent(new Event(walletChangeEvent));
}

export async function openAltanaWallet(): Promise<AltanaWallet> {
  const existing = storedAltanaWalletAddress();
  const wallet = existing
    ? await altana.recoverFromPasskey({ rpId: relyingPartyId() })
    : await altana.createPasskeyWallet({
        name: `AgentDesk ${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        rpId: relyingPartyId(),
      });
  window.localStorage.setItem(walletStorageKey, wallet.address);
  window.dispatchEvent(new Event(walletChangeEvent));
  return wallet;
}

export async function readAltanaBalances(wallet: AltanaWallet): Promise<AltanaBalances> {
  const paymentToken = ERC8183_ADDRESSES[BNB_TESTNET.chainId]?.paymentToken;
  if (!paymentToken) throw new Error("ERC-8183 payment token is unavailable");
  const result = await altana.balances({ wallet, tokens: [paymentToken] });
  const token = result.tokens?.[0];
  return {
    native: formatEther(result.native),
    nativeWei: result.native.toString(),
    paymentToken: token?.ok ? token.display : "unavailable",
    paymentTokenRaw: token?.ok ? token.raw.toString() : null,
  };
}

export async function claimTestPaymentToken(wallet: AltanaWallet): Promise<Hex> {
  const result = await altana.execute({
    wallet,
    signer: wallet.signer,
    calls: {
      to: U_FAUCET,
      data: encodeFunctionData({
        abi: [
          {
            name: "requestTokens",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [],
            outputs: [],
          },
        ],
        functionName: "requestTokens",
      }),
    },
  });
  return requireConfirmed(result, "$U faucet claim");
}

function requireConfirmed(
  result: { status: "CONFIRMED" | "FAILED" | "PENDING"; transactionHash?: Hex },
  operation: string,
): Hex {
  if (result.status !== "CONFIRMED" || !result.transactionHash) {
    throw new Error(`${operation} was not confirmed on BSC testnet`);
  }
  return result.transactionHash;
}

export async function grantSessionAndHire(input: {
  wallet: AltanaWallet;
  agent: Agent;
  spendCap: number;
  durationSeconds: number;
}): Promise<OnchainHireResult> {
  const expiry = Math.floor(Date.now() / 1000) + input.durationSeconds;
  const addresses = ERC8183_ADDRESSES[BNB_TESTNET.chainId];
  if (!addresses) throw new Error("ERC-8183 is unavailable on BSC testnet");

  const session: GrantSessionResult = await altana.grantSession({
    wallet: input.wallet,
    signer: input.wallet.signer,
    permissions: {
      calls: input.agent.allowlist.map((contract) => ({ to: contract.address as Address })),
      spend: [
        {
          limit: parseUnits(String(input.spendCap), 18),
          period: "day",
          token: addresses.paymentToken,
        },
        { limit: nativeFeeAllowance, period: "day" },
      ],
    },
    expiry,
    register: true,
  });

  let hire: Awaited<ReturnType<typeof hireErc8183Agent>>;
  try {
    hire = await hireErc8183Agent(
      input.wallet,
      input.wallet.signer,
      {
        provider: input.agent.address as Address,
        task: `Hire ${input.agent.name} through AgentDesk for the ${input.agent.category} category.`,
        budget: hireBudget,
        deadlineSeconds: input.durationSeconds,
      },
      { network: BNB_TESTNET },
    );
  } catch (hireError) {
    try {
      const cleanup = await altana.revokeSession({
        wallet: input.wallet,
        signer: input.wallet.signer,
        session: session.publicKey,
      });
      requireConfirmed(cleanup, "Automatic session cleanup");
      window.localStorage.removeItem(orphanSessionStorageKey);
    } catch (cleanupError) {
      window.localStorage.setItem(orphanSessionStorageKey, session.publicKey);
      throw new Error(
        `ERC-8183 hire failed and the session still needs revocation: ${hireError instanceof Error ? hireError.message : "unknown hire error"}`,
        { cause: cleanupError },
      );
    }
    throw new Error("ERC-8183 hire failed. The newly granted session was revoked automatically.", { cause: hireError });
  }

  return {
    altanaWalletAddress: input.wallet.address,
    sessionPublicKey: session.publicKey,
    keystoreTxHash: session.transactionHash ?? null,
    erc8183TxHash: requireConfirmed(hire, "ERC-8183 hire"),
    erc8183JobId: hire.jobId.toString(),
    expiryAt: new Date(expiry * 1000).toISOString(),
  };
}

export async function revokeOnchain(sessionPublicKey: Hex) {
  const wallet = await openAltanaWallet();
  const result = await altana.revokeSession({
    wallet,
    signer: wallet.signer,
    session: sessionPublicKey,
  });
  return {
    walletAddress: wallet.address,
    revokeTxHash: requireConfirmed(result, "Session revoke"),
  };
}

export async function revokeOrphanSession(wallet: AltanaWallet, sessionPublicKey: Hex) {
  const result = await altana.revokeSession({
    wallet,
    signer: wallet.signer,
    session: sessionPublicKey,
  });
  const transactionHash = requireConfirmed(result, "Leftover session revoke");
  window.localStorage.removeItem(orphanSessionStorageKey);
  return transactionHash;
}
