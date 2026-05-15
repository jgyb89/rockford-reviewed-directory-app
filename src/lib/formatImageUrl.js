/**
 * TEMPORARY STAGING FIX
 * 
 * This utility intercepts image URLs coming from the WordPress database.
 * If the database accidentally returns the production URL (capecoralreviewed.com),
 * this forces it to use the staging URL so the images successfully load.
 * 
 * TODO: Delete this file and remove its imports when pushing to production.
 */

import { BASE_URL } from "@/lib/constants";

export function formatImageUrl(sourceUrl) {
  if (!sourceUrl) return "/placeholder-image.jpg";

  const productionDomain = BASE_URL;
  const stagingDomain = "https://staging.capecoralreviewed.com";

  // If the URL already has staging, leave it alone
  if (sourceUrl.includes(stagingDomain)) {
    return sourceUrl;
  }

  // If the URL has the production domain, swap it to staging
  if (sourceUrl.includes(productionDomain)) {
    return sourceUrl.replace(productionDomain, stagingDomain);
  }

  // Return the original URL as a fallback
  return sourceUrl;
}
