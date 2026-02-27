/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exclude infrastructure directory from Next.js compilation
  webpack: (config, { isServer }) => {
    // Ignore CDK infrastructure files
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/infrastructure/**', '**/cdk.out/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default nextConfig;
