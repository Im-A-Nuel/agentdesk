import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { bscTestnet } from "wagmi/chains";

const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "agentdesk-hackathon-demo";

export const wagmiConfig = getDefaultConfig({
  appName: "AgentDesk",
  projectId: WALLETCONNECT_PROJECT_ID,
  chains: [bscTestnet],
  ssr: true,
});