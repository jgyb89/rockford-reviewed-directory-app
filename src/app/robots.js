import { BASE_URL } from "@/lib/constants";

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
