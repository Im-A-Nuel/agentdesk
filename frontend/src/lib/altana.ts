import { BNB_TESTNET } from "@altananetwork/sdk";
import { createPublicClient, http, keccak256, type Address, type Hex } from "viem";

const KEYSTORE_ABI = [
  {
    name: "isValidKey",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "user", type: "address" },
      { name: "keyId", type: "bytes32" },
    ],
    outputs: [{ type: "bool" }],
  },
] as const;

const publicClient = createPublicClient({
  chain: BNB_TESTNET.chain,
  transport: http(process.env.BSC_TESTNET_RPC_URL || BNB_TESTNET.publicRpcUrl),
});

export async function isSessionValid(input: {
  walletAddress: Address;
  sessionPublicKey: Hex;
}): Promise<boolean> {
  return publicClient.readContract({
    address: BNB_TESTNET.keyStore,
    abi: KEYSTORE_ABI,
    functionName: "isValidKey",
    args: [input.walletAddress, keccak256(input.sessionPublicKey)],
  });
}

export async function isSuccessfulTransaction(hash: Hex, expectedAddress?: Address): Promise<boolean> {
  const receipt = await publicClient.getTransactionReceipt({ hash });
  if (receipt.status !== "success") return false;
  if (!expectedAddress) return true;
  const expected = expectedAddress.toLowerCase();
  return receipt.to?.toLowerCase() === expected || receipt.logs.some((log) => log.address.toLowerCase() === expected);
}
