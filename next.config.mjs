/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Acknowledge turbopack config (next-pwa uses webpack internally)
  turbopack: {},
}

export default nextConfig
