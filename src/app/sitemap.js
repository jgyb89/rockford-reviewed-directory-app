import { getListings } from "@/lib/api";
import { getBlogPosts } from "@/lib/actions";
import { getLocalizedUrl } from "@/lib/constants";

const BASE_URL = "https://capecoralreviewed.com";

export default async function sitemap() {
  // 1. Fetch data from WordPress
  const listings = await getListings();
  const posts = await getBlogPosts();

  // 2. Define core static pages
  const staticPages = [
    "",
    "/directory",
    "/blog",
    "/register",
    "/register-business",
    "/login",
    "/submit-listing",
    "/privacy-policy",
    "/terms-of-service",
  ];

  const staticEntries = staticPages.map((path) => ({
    url: `${BASE_URL}${getLocalizedUrl(path, "en")}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1.0 : 0.8,
  }));

  // 3. Map listings
  const listingEntries = listings.map((listing) => ({
    url: `${BASE_URL}${getLocalizedUrl(`/listing/${listing.slug}`, "en")}`,
    lastModified: new Date(listing.date || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 4. Map blog posts
  const postEntries = posts.map((post) => ({
    url: `${BASE_URL}${getLocalizedUrl(`/blog/${post.slug}`, "en")}`,
    lastModified: new Date(post.date || new Date()),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...listingEntries, ...postEntries];
}
