/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image domains for external avatars if needed
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.pu.edu.pk",
      },
    ],
  },

  // Suppress Prisma warnings in Next.js build
  webpack: (config) => {
    config.externals.push("@prisma/client");
    return config;
  },
};

export default nextConfig;
