import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow common external image hosts used by the app
    domains: ["images.unsplash.com", "images.cloudinary.com", "res.cloudinary.com"],
    // Optionally, use remotePatterns for more granular control if needed
    // remotePatterns: [
    //   { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' }
    // ]
  },
};

export default nextConfig;
