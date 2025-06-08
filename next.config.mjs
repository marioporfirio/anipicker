// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // A API do AniList pode servir imagens de diferentes subdomínios (s1, s2, s3, s4...).
        // Usar um wildcard (*) é a forma mais robusta de autorizar todos eles de uma vez.
        hostname: 's*.anilist.co',
      },
    ],
  },
};

export default nextConfig;