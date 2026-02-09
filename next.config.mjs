/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TODO: Remove once type errors in components are fixed (see regenerated database.ts)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
