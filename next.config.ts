import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Phone testing loads the dev server by this Mac's LAN address, not localhost.
  allowedDevOrigins: ["127.0.0.1", "192.168.100.29"],
};

export default nextConfig;
