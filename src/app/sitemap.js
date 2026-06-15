import { getListings } from "@/lib/api";
import { getBlogPosts } from "@/lib/actions";
import { getLocalizedUrl, BASE_URL, ALL_CATEGORIES, DIRECTORY_TYPES } from "@/lib/constants";
import { getEvents } from "@/lib/graphql/events";


export default async function sitemap() {
  const listings = await getListings();
  const posts = await getBlogPosts();

  const eventsResponse = await getEvents();
  const events = eventsResponse?.data?.nodes || [];

  const staticPages = [
    "",
    "/directory",
    "/events",
    "/blog",
    "/register",
    "/register-business",
    "/login",
    "/submit-listing",
    "/privacy-policy",
    "/terms-of-service",
  ];

  const staticEntries = staticPages.map((path) => ({
    url: BASE_URL + getLocalizedUrl(path, "en"),
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: path === "" ? 1.0 : 0.8,
  }));

  // Map Main Directory Types (e.g. /directory/food-drink)
  const directoryTypeEntries = DIRECTORY_TYPES.map((type) => ({
    url: BASE_URL + "/directory/" + type.slug,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Map All Sub-Categories (e.g. /directory/food-drink/restaurants)
  const categoryEntries = ALL_CATEGORIES.map((cat) => {
    let path = "";
    if (cat.directoryType) {
      path = `/directory/${cat.directoryType}/${cat.slug}`;
    } else if (cat.parentSlug) {
      const parent = ALL_CATEGORIES.find((p) => p.slug === cat.parentSlug);
      if (parent && parent.directoryType) {
        path = `/directory/${parent.directoryType}/${cat.slug}`;
      }
    }
    
    // Fallback if no path is generated
    if (!path) return null;


    return {
      url: BASE_URL + path,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    };
  }).filter(Boolean);

  const listingEntries = listings.map((listing) => ({
    url: BASE_URL + getLocalizedUrl("/listing/" + listing.slug, "en"),
    lastModified: new Date(listing.date || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const postEntries = posts.map((post) => ({
    url: BASE_URL + getLocalizedUrl("/blog/" + post.slug, "en"),
    lastModified: new Date(post.date || new Date()),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const eventEntries = events.map((event) => ({
    url: BASE_URL + getLocalizedUrl("/events/" + event.slug, "en"),
    lastModified: new Date(event.date || new Date()),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...staticEntries,
    ...directoryTypeEntries,
    ...categoryEntries,
    ...listingEntries,
    ...postEntries,
    ...eventEntries,
  ];
}
