/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even with ESLint errors
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Temporarily bypass TypeScript errors for deployment
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
