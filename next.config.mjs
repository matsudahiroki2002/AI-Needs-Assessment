/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"]
  },
  reactStrictMode: true,
  eslint: {
    dirs: ["src"]
  },
  poweredByHeader: false
};

export default nextConfig;
