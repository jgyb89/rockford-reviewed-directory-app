/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staging.rockfordreviewed.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "rockfordreviewed.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "wp.rockfordreviewed.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["rockfordreviewed.com", "staging.rockfordreviewed.com", "wp.rockfordreviewed.com"],
    },
  },
  async redirects() {
    const legacyBlogSlugs = [
      "weekend-brunch-at-blossom-brie-a-farm-to-table-review-worth-the-visit",
    ];

    return legacyBlogSlugs.map((slug) => ({
      source: `/:locale(en|es)/${slug}`,
      destination: `/:locale/blog/${slug}`,
      permanent: true,
    }));
  },
};

export default nextConfig;
