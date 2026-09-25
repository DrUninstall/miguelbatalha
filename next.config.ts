import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Emit /blog/index.html etc. so /blog/ works on GitHub Pages, which also
  // redirects /blog to /blog/.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
