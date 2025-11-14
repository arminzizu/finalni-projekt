import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Za Vercel deploy - nije potrebno ništa dodatno
  // Za Firebase Hosting sa statičkim exportom, odkomentiraj sljedeću liniju:
  // output: 'export',
};

export default nextConfig;
