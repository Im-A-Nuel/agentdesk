import { NextResponse, type NextRequest } from "next/server";
import { BNB_TESTNET, ERC8183_ADDRESSES, getErc8183Job } from "@altananetwork/sdk";
import { keccak256, parseUnits, type Address, type Hex } from "viem";

import { getAgent } from "@/lib/agents-repo";
import { isSessionValid, isSuccessfulTransaction } from "@/lib/altana";
import { createHire as saveHire, getHireByJobId, type HireRecord } from "@/lib/hire-store";

const MIN_DAILY_LIMIT = 100;
const MAX_DAILY_LIMIT = 25_000;
const MIN_DURATION_SECONDS = 7 * 86_400;
const MAX_DURATION_SECONDS = 90 * 86_400;

function error(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status });
}

function matchesProof(hire: HireRecord, input: {
  agentId: string;
  wallet: string;
  sessionPublicKey: string;
  transactionHash: string;
}) {
  return hire.agentId === input.agentId &&
    hire.altanaWalletAddress?.toLowerCase() === input.wallet.toLowerCase() &&
    hire.sessionPublicKey?.toLowerCase() === input.sessionPublicKey.toLowerCase() &&
    hire.erc8183TxHash.toLowerCase() === input.transactionHash.toLowerCase();
}

export async function POST(req: NextRequest) {
  let body: {
    agentId?: string;
    spendCap?: number;
    durationSeconds?: number;
    userWallet?: string;
    altanaWalletAddress?: string;
    sessionPublicKey?: string;
    keystoreTxHash?: string | null;
    erc8183TxHash?: string;
    erc8183JobId?: string;
    expiryAt?: string;
  } | null = null;
  try {
    body = await req.json();
  } catch {
    return error(400, "BAD_JSON", "Request body must be valid JSON");
  }

  const agentId = body?.agentId;
  const spendCap = Number(body?.spendCap);
  const durationSeconds = Number(body?.durationSeconds);
  const userWallet = body?.userWallet;
  const altanaWalletAddress = body?.altanaWalletAddress;
  const sessionPublicKey = body?.sessionPublicKey;
  const keystoreTxHash = body?.keystoreTxHash;
  const erc8183TxHash = body?.erc8183TxHash;
  const erc8183JobId = body?.erc8183JobId;
  const erc8183Addresses = ERC8183_ADDRESSES[BNB_TESTNET.chainId];
  if (!erc8183Addresses) {
    return error(500, "NETWORK_CONFIG", "ERC-8183 is unavailable on this network");
  }

  const agent = agentId ? await getAgent(agentId) : undefined;
  if (!agent) return error(400, "INVALID_AGENT", "Unknown agent id");
  if (!userWallet || !/^0x[a-fA-F0-9]{40}$/.test(userWallet)) {
    return error(400, "INVALID_WALLET", "A valid wallet address is required");
  }
  if (!altanaWalletAddress || !/^0x[a-fA-F0-9]{40}$/.test(altanaWalletAddress)) {
    return error(400, "INVALID_ALTANA_WALLET", "A valid Altana wallet address is required");
  }
  if (userWallet.toLowerCase() !== altanaWalletAddress.toLowerCase()) {
    return error(400, "WALLET_MISMATCH", "Dashboard wallet must match the Altana wallet");
  }
  if (!sessionPublicKey || !/^0x(?:[a-fA-F0-9]{2})+$/.test(sessionPublicKey)) {
    return error(400, "INVALID_SESSION_KEY", "A valid session public key is required");
  }
  if (!erc8183TxHash || !/^0x[a-fA-F0-9]{64}$/.test(erc8183TxHash)) {
    return error(400, "INVALID_HIRE_TX", "A valid ERC-8183 transaction hash is required");
  }
  if (keystoreTxHash && !/^0x[a-fA-F0-9]{64}$/.test(keystoreTxHash)) {
    return error(400, "INVALID_KEYSTORE_TX", "Invalid Keystore transaction hash");
  }
  if (!erc8183JobId || !/^\d+$/.test(erc8183JobId)) {
    return error(400, "INVALID_JOB", "A valid ERC-8183 job id is required");
  }
  if (!Number.isFinite(spendCap) || spendCap < MIN_DAILY_LIMIT || spendCap > MAX_DAILY_LIMIT) {
    return error(400, "INVALID_CAP", `Daily spend limit must be between ${MIN_DAILY_LIMIT} and ${MAX_DAILY_LIMIT.toLocaleString("en-US")} test $U`);
  }
  if (!Number.isFinite(durationSeconds) || durationSeconds < MIN_DURATION_SECONDS || durationSeconds > MAX_DURATION_SECONDS) {
    return error(400, "INVALID_DURATION", "Duration must be between 7 and 90 days");
  }

  try {
    const expiresAt = new Date(body?.expiryAt ?? "");
    const expectedExpiry = Date.now() + durationSeconds * 1000;
    if (
      Number.isNaN(expiresAt.getTime()) ||
      Math.abs(expiresAt.getTime() - expectedExpiry) > 5 * 60_000
    ) {
      return error(400, "INVALID_EXPIRY", "The onchain expiry does not match the requested duration");
    }

    const [sessionValid, hireTxValid, keystoreTxValid, job] = await Promise.all([
      isSessionValid({
        walletAddress: altanaWalletAddress as Address,
        sessionPublicKey: sessionPublicKey as Hex,
      }),
      isSuccessfulTransaction(erc8183TxHash as Hex, erc8183Addresses.commerce),
      keystoreTxHash ? isSuccessfulTransaction(keystoreTxHash as Hex, BNB_TESTNET.keyStore) : Promise.resolve(true),
      getErc8183Job(BNB_TESTNET, BigInt(erc8183JobId)),
    ]);
    if (!sessionValid) return error(422, "SESSION_NOT_ACTIVE", "Session is not active in Keystore");
    if (!hireTxValid) return error(422, "HIRE_NOT_CONFIRMED", "ERC-8183 hire is not confirmed");
    if (!keystoreTxValid) return error(422, "KEYSTORE_NOT_CONFIRMED", "Keystore registration is not confirmed");
    if (
      job.client.toLowerCase() !== altanaWalletAddress.toLowerCase() ||
      job.provider.toLowerCase() !== agent.address.toLowerCase() ||
      job.statusName !== "FUNDED" ||
      job.budget !== parseUnits("0.1", 18)
    ) {
      return error(422, "JOB_MISMATCH", "ERC-8183 job does not match this hire");
    }

    const proof = {
      agentId: agent.id,
      wallet: altanaWalletAddress,
      sessionPublicKey,
      transactionHash: erc8183TxHash,
    };
    const existing = await getHireByJobId(erc8183JobId);
    if (existing) {
      if (!matchesProof(existing, proof)) {
        return error(409, "JOB_ALREADY_RECORDED", "This ERC-8183 job is already linked to another hire");
      }
      return NextResponse.json({ hire: existing });
    }

    const hire = await saveHire({
      userWallet,
      altanaWalletAddress,
      agentId: agent.id,
      sessionKeyAddress: keccak256(sessionPublicKey as Hex),
      sessionPublicKey,
      keystoreTxHash: keystoreTxHash ?? null,
      erc8183TxHash,
      erc8183JobId,
      revokeTxHash: null,
      spendCap,
      spent: 0,
      expiryAt: expiresAt.toISOString(),
      status: "active",
    });

    if (!matchesProof(hire, proof)) {
      return error(409, "JOB_ALREADY_RECORDED", "This ERC-8183 job is already linked to another hire");
    }

    return NextResponse.json({ hire }, { status: 201 });
  } catch {
    return error(500, "INTERNAL", "Could not create the session. Please try again.");
  }
}
