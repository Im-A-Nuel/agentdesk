/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Altana's transitive wallet packages reference optional browser-native modules.
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
