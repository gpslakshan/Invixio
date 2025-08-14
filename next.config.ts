import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "lh3.googleusercontent.com",
        protocol: "https",
        port: "",
      },
      {
        hostname: "invixio-saas.s3.ap-south-1.amazonaws.com",
        protocol: "https",
        port: "",
      },
    ],
  },
};

export default nextConfig;
