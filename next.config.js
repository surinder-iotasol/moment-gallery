/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Image domains
  images: {
    domains: ["images.unsplash.com", "res.cloudinary.com"],
  },
  // Environment variables
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
    NEXT_PUBLIC_SOCKET_SERVER_URL:
      process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "",
  },
  // For Netlify deployment
  output: "standalone",
};

module.exports = nextConfig;
