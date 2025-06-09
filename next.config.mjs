/** @type {import('next').NextConfig} */
const nextConfig = {
  // CORRIGIDO: Movido para fora do bloco 'experimental'
  allowedDevOrigins: ["http://127.0.0.1:3000"],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's4.anilist.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;