import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Za Firebase Hosting sa statičkim exportom:
  output: 'export',
  images: {
    unoptimized: true, // Potrebno za static export
  },
  // Za Vercel deploy, zakomentiraj gore navedene linije
};

export default nextConfig;
