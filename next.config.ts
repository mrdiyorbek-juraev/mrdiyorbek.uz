import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // next/image refuses remote hosts unless they're listed here. These cover
    // pasting an avatar URL straight from a GitHub or Google profile instead of
    // downloading the file into public/.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
