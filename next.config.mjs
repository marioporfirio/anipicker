/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        port: '',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 2678400, // 31 days
    formats: ['image/webp'],
    // TODO: Analyze and configure imageSizes and deviceSizes if necessary
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // TODO: Analyze and configure qualities if necessary
    // qualities: [75],
  },
};

export default nextConfig;