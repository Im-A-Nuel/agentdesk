/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // @coinbase/cdp-sdk references optional @x402/* modules that are not installed.
    // @metamask/sdk and @walletconnect/logger lazily require optional modules that only
    // matter on React Native or when a pretty log transport is configured, neither of which
    // applies to AgentDesk. A bare "@x402" alias also matches every "@x402/<subpath>" request.
    config.resolve.alias = {
      ...config.resolve.alias,
      "@x402": false,
      "@react-native-async-storage/async-storage": false,
      "pino-pretty": false,
    };
    return config;
  },
};

export default nextConfig;