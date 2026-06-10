/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: "https",
        hostname: "staging.capecoralreviewed.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "capecoralreviewed.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
      {
        protocol: "https",
        hostname: "wp.capecoralreviewed.com",
        port: "",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["capecoralreviewed.com", "staging.capecoralreviewed.com", "wp.capecoralreviewed.com"],
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
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com https://www.googletagmanager.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' blob: data: https://*.capecoralreviewed.com https://i.ytimg.com https://*.youtube.com https://www.google-analytics.com https://www.googletagmanager.com https://maps.googleapis.com; connect-src 'self' https://*.capecoralreviewed.com https://accounts.google.com https://www.google-analytics.com https://stats.g.doubleclick.net https://www.googletagmanager.com https://maps.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; frame-src 'self' https://www.youtube.com https://player.vimeo.com https://accounts.google.com; media-src 'self' https://wp.capecoralreviewed.com;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
