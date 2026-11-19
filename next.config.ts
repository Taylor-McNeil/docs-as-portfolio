import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";

// Professional writing moved under /professional-work. These permanent (308)
// redirects keep existing external links working; do not remove them.
const professionalWorkRedirects = [
  "/tutorials/java-game-dev",
  "/tutorials/mongodb-tanstack",
  "/guides/hmac-authentication",
  "/case-studies/stellar-api-docs",
  "/case-studies/on-good-tutorials",
].map((source) => ({
  source,
  destination: `/professional-work${source}`,
  permanent: true,
}));

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  allowedDevOrigins: ["192.168.*.*"],
  async redirects() {
    return professionalWorkRedirects;
  },
  async headers() {
    return [
      {
        source: "/tools/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex",
          },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [],
  },
});

export default withMDX(nextConfig);
