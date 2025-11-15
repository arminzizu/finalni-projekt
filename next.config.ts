import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Za Firebase Hosting sa statičkim exportom:
  output: 'export',
  images: {
    unoptimized: true, // Potrebno za static export
  },
  // API routes ne mogu biti statički export-ovani - ukloni ih ili koristi Firebase Functions
  // Za Vercel deploy, zakomentiraj gore navedene linije
};

export default nextConfig;
