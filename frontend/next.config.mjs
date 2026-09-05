/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // @coinbase/cdp-sdk references optional @x402/* modules that are not installed.
    // They are only reachable through the Coinbase smart-account connector, which is never
    // used in AgentDesk (users connect via injected wallets on BSC testnet), so drop them.
    // A bare "@x402" alias also matches every "@x402/<subpath>" request.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402": false,
    };
    return config;
  },
};

export default nextConfig;