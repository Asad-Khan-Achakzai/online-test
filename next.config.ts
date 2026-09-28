import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static files in `out/` so the exam can be hosted without a Node server.
  output: "export",
  // Phone testing loads the dev server by this Mac's LAN address, not localhost.
  allowedDevOrigins: ["127.0.0.1", "192.168.100.29"],
};

export default nextConfig;
