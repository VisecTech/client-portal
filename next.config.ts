import type { NextConfig } from 'next';

// Self-hosted behind nginx/systemd (standalone). See the nextjs-standalone-deploy skill.
const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
};

export default nextConfig;
