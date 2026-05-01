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
    minimumCacheTTL: 2678400,
    formats: ['image/avif', 'image/webp'],
    // Cards de anime: máx ~400px de largura. Perfis/banners: até ~1200px.
    imageSizes: [96, 192, 384],
    deviceSizes: [640, 828, 1080, 1200, 1920],
    qualities: [75],
  },
};

export default nextConfig;