import categoriesData from "./categories-data.json";

export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://capecoralreviewed.com";

// Dynamically generate directory types from navigation data
export const DIRECTORY_TYPES = categoriesData.map((cat) => ({
  name: cat.title,
  slug: cat.slug,
}));

// Dynamically flatten the navigation data into the ALL_CATEGORIES array shape
export const ALL_CATEGORIES = categoriesData.flatMap((cat) => {
  const parent = {
    name: cat.title,
    slug: cat.slug,
    directoryType: cat.slug,
    isParent: true,
  };
  
  const children = cat.subs.map((sub) => ({
    name: sub.name,
    slug: sub.slug,
    parentSlug: cat.slug,
  }));
  
  return [parent, ...children];
});

export function getLocalizedUrl(path, locale) {
  if (locale === 'es') {
    if (path.startsWith('/es/') || path === '/es') return path;
    return `/es${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
}
