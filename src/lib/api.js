// lib/api.js

const CORE_LISTING_FIELDS = `
  id
  databaseId
  title
  date
  slug
  content
  featuredImage { node { sourceUrl altText } }
  listingdata {
    addressStreet addressCity phoneNumber priceRange
    hoursMonday hoursTuesday hoursWednesday hoursThursday hoursFriday hoursSaturday hoursSunday
  }
  directoryTypes { nodes { name slug } }
  ccrlistingcategories { nodes { name slug } }
  reviews { nodes { reviewFields { starRating } } }
  author { 
    node { 
      name 
      userData { isFeaturedUser } 
      customAvatar { customAvatar { node { sourceUrl } } } 
      avatar { url } 
    } 
  }
`;

async function safeJsonParse(res) {
  if (!res.ok) {
    console.error(`HTTP Error: status ${res.status}`);
    return null;
  }
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    console.error(`Unexpected content-type: ${contentType}`);
    return null;
  }
  try {
    return await res.json();
  } catch (error) {
    console.error("JSON parsing failed:", error);
    return null;
  }
}

export async function getListingBySlug(slug) {
  const query = `
    query GetListingBySlug($id: ID!) {
      ccrlisting(id: $id, idType: SLUG) {
        id
        databaseId
        title
        content
        
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }

        attachedMedia(first: 10) {
          nodes {
            sourceUrl
          }
        }

        seo {
          title
          metaDesc
          opengraphImage {
            sourceUrl
          }
        }
        
        directoryTypes {
          nodes {
            name
            slug
          }
        }
        ccrlistingcategories {
          nodes {
            name
            slug
          }
        }
        
        listingdata {
          addressStreet
          addressCity
          addressState
          addressZipCode
          phoneNumber
          businessEmail
          websiteUrl
          socialUrl
          priceRange
          
          hoursMonday
          hoursTuesday
          hoursWednesday
          hoursThursday
          hoursFriday
          hoursSaturday
          hoursSunday
          
          videoUrl
        }

        reviews(first: 100) {
          nodes {
            databaseId
            date
            title
            content
            reviewFields {
              starRating
            }
            author {
              node {
                name
                avatar {
                  url
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0",
      },
      body: JSON.stringify({
        query,
        variables: { id: slug },
      }),
      next: { revalidate: 60 },
    });

    const json = await safeJsonParse(res);
    if (!json) return null;

    if (json.errors) {
      console.error("GraphQL API Errors (getListingBySlug):", json.errors);
      throw new Error("Failed to fetch listing data from GraphQL");
    }

    return json.data?.ccrlisting;
  } catch (error) {
    console.error("Network or Fetch Error:", error);
    return null;
  }
}

export async function getListings(categorySlug = null) {
  const query = categorySlug
    ? `query GetListingsWithCategory($categorySlug: [String]) {
        ccrlistings(first: 100, where: { 
          taxQuery: {
            taxArray: [
              { taxonomy: CCRLISTINGCATEGORY, field: SLUG, terms: $categorySlug }
            ]
          }
        }) {
          nodes {
            ${CORE_LISTING_FIELDS}
          }
        }
      }`
    : `query GetListingsAll {
        ccrlistings(first: 100) {
          nodes {
            ${CORE_LISTING_FIELDS}
          }
        }
      }`;

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0",
      },
      body: JSON.stringify({
        query,
        variables: categorySlug ? { categorySlug: [categorySlug] } : {},
      }),
      next: { revalidate: 60 },
    });

    const json = await safeJsonParse(res);
    if (!json) return [];

    if (json.errors) {
      console.error("GraphQL API Errors (getListings):", json.errors);
      return [];
    }

    return json.data?.ccrlistings?.nodes || [];
  } catch (error) {
    console.error("Fetch Error:", error);
    return [];
  }
}

export async function getListingsByCategory(categorySlug, directoryType = null) {
  const query = `
    query GetListingsByCategory($categorySlug: [String], $directoryType: [String]) {
      ccrlistings(first: 100, where: { 
        taxQuery: {
          relation: AND,
          taxArray: [
            { taxonomy: DIRECTORYTYPE, field: SLUG, terms: $directoryType },
            { taxonomy: CCRLISTINGCATEGORY, field: SLUG, terms: $categorySlug }
          ]
        }
      }) {
        nodes {
          ${CORE_LISTING_FIELDS}
        }
      }
    }
  `;
  const variables = { categorySlug: [categorySlug], directoryType: directoryType ? [directoryType] : null };
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "User-Agent": "CCR-NextJS-Frontend/1.0" },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 },
    });
    const json = await safeJsonParse(res);
    return json?.data?.ccrlistings?.nodes || [];
  } catch (error) {
    return [];
  }
}

export async function getListingsByDirectoryType(directoryTypeSlug) {
  const query = `
    query GetListingsByDirectoryType($directoryType: [String]) {
      ccrlistings(first: 100, where: { 
        taxQuery: {
          taxArray: [{ taxonomy: DIRECTORYTYPE, field: SLUG, terms: $directoryType }]
        }
      }) {
        nodes {
          ${CORE_LISTING_FIELDS}
        }
      }
    }
  `;
  try {
    const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json", "User-Agent": "CCR-NextJS-Frontend/1.0" },
      body: JSON.stringify({ query, variables: { directoryType: [directoryTypeSlug] } }),
      next: { revalidate: 60 },
    });
    const json = await safeJsonParse(res);
    return json?.data?.ccrlistings?.nodes || [];
  } catch (error) {
    return [];
  }
}

export async function updateUserFavorites(userId, favoriteIdsArray, authToken) {
  const mutation = `
    mutation UpdateUserFavorites($id: ID!, $favorites: [Int]) {
      updateUser(input: {
        id: $id, 
        favorite_listing: $favorites
      }) {
        user {
          id
          databaseId
          favorite_listing {
            nodes {
              databaseId
            }
          }
        }
      }
    }
  `;

  const variables = {
    id: userId,
    favorites: favoriteIdsArray,
  };

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0",
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const json = await safeJsonParse(res);
    if (!json) return null;

    if (json.errors) {
      console.error("GraphQL Errors:", json.errors);
      throw new Error("Failed to update favorites");
    }
    return json.data?.updateUser?.user;
  } catch (error) {
    console.error("Error updating favorites:", error);
    return null;
  }
}
