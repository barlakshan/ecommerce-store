import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.21st.dev", pathname: "/assets/**" }],
  },
  experimental: {
    serverActions: {
      // Bank slips can be up to 5 MB.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
