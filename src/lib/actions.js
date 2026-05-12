// src/lib/actions.js
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { loginUser, getViewer } from "./auth";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

/**
 * Server Action to handle user login.
 */
export async function handleLogin(username, password) {
  try {
    const user = await loginUser(username, password);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Helper to handle GraphQL errors and detect token expiration.
 */
async function handleGraphQLError(json) {
  if (json.errors) {
    const isTokenError = json.errors.some(
      (e) =>
        e.extensions?.debugMessage === "Expired token" ||
        e.message?.includes("Expired token") ||
        e.message?.includes("jwt_auth_invalid_token") ||
        e.message?.includes("invalid_token")
    );

    if (isTokenError) {
      const cookieStore = await cookies();
      cookieStore.set("authToken", "", { maxAge: 0 });
      redirect("/en/login");
    }
    
    throw new Error(json.errors[0].message);
  }
}

/**
 * Server Action to update the user's profile.
 */
export async function updateUserProfile(formData) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value;

  if (!authToken) {
    redirect("/en/login");
  }

  const viewer = await getViewer();
  if (!viewer?.id) {
    redirect("/en/login");
  }
  
  const userId = viewer.id;

  const mutation = `
    mutation UpdateUserProfile($input: UpdateUserInput!) {
      updateUser(input: $input) {
        user {
          id
          firstName
          lastName
          customAvatar {
            customAvatar {
              node {
                sourceUrl
              }
            }
          }
          userData {
            phoneNumber
            websiteUrl
            emailVisibility
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            id: userId,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber,
            websiteUrl: formData.websiteUrl,
            emailVisibility: formData.emailVisibility,
            ...(formData.avatarId && { customAvatar: Number.parseInt(formData.avatarId) }),
          },
        },
      }),
    });

    const json = await res.json();
    await handleGraphQLError(json);

    revalidatePath("/dashboard", "layout");
    return { success: true, user: json.data.updateUser.user };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to delete a user's review.
 */
export async function deleteUserReview(reviewId) {
  const authToken = (await cookies()).get("authToken")?.value;
  if (!authToken) return { success: false, error: "Not authenticated" };

  const mutation = `
    mutation DeleteReview($id: ID!) {
      deleteCcrreview(input: { id: $id }) {
        deletedId
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query: mutation, variables: { id: reviewId } }),
    });

    const json = await res.json();
    await handleGraphQLError(json);

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Delete Review Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to remove a listing from user's favorites.
 */
export async function removeFavoriteListing(listingId) {
  const authToken = (await cookies()).get("authToken")?.value;
  if (!authToken) return { success: false, error: "Not authenticated" };

  try {
    const viewer = await getViewer();
    if (!viewer) throw new Error("Could not fetch viewer data");

    const currentFavorites = viewer.userData?.favoriteListings?.nodes.map((n) => n.databaseId) || [];
    const updatedFavorites = currentFavorites.filter((id) => id.toString() !== listingId.toString());

    const mutation = `
    mutation UpdateUserFavorites($userId: ID!, $favorites: [Int]) {
      updateUser(input: { id: $userId, favoriteListings: $favorites }) {
        user { databaseId }
      }
    }
    `;

    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({
        query: mutation,
        variables: { userId: viewer.id, favorites: updatedFavorites },
      }),
    });

    const json = await res.json();
    await handleGraphQLError(json);

    return { success: true };
  } catch (error) {
    console.error("Remove Favorite Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleFavoriteListing(listingId) {
  const token = (await cookies()).get("authToken")?.value;
  if (!token) return { success: false, error: "Unauthorized. Please log in." };

  try {
    const viewer = await getViewer();
    if (!viewer) throw new Error("Could not fetch viewer data");

    const currentFavorites = viewer.userData?.favoriteListings?.nodes?.map((n) => n.databaseId) || [];
    const listingDbId = parseInt(listingId);
    
    let updatedFavorites;
    if (currentFavorites.includes(listingDbId)) {
      updatedFavorites = currentFavorites.filter((id) => id !== listingDbId);
    } else {
      updatedFavorites = [...currentFavorites, listingDbId];
    }

    const mutation = `
      mutation UpdateUserFavorites($userId: ID!, $favorites: [Int]) {
        updateUser(input: { id: $userId, favoriteListings: $favorites }) {
          user { databaseId }
        }
      }
    `;

    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({
        query: mutation,
        variables: { userId: viewer.id, favorites: updatedFavorites },
      }),
    });

    const json = await res.json();
    await handleGraphQLError(json);

    revalidatePath("/directory");
    revalidatePath("/dashboard/favorites");
    return { success: true };
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    return { success: false, error: error.message || "Network error occurred." };
  }
}

/**
 * Server Action to submit a user review.
 */
export async function submitUserReview(formData) {
  const token = (await cookies()).get("authToken")?.value;
  if (!token) return { success: false, message: "Unauthorized. Please log in to leave a review." };

  const mutation = `
    mutation CreateReview($input: CreateCcrreviewInput!) {
      createCcrreview(input: $input) {
        ccrreview {
          databaseId
          title
          content
          reviewFields { starRating }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            title: formData.title || `Review for Listing #${formData.listingId}`,
            content: formData.content,
            starRating: String(formData.rating),
            relatedListing: [Number.parseInt(formData.listingId, 10)],
            status: "PUBLISH",
          },
        },
      }),
    });

    const json = await res.json();
    if (json.errors) return { success: false, message: json.errors[0].message || "Failed to submit review." };

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Submit Review Action Error:", error);
    return { success: false, message: "Network error occurred while submitting review." };
  }
}

/**
 * Server Action to fetch a listing for editing.
 */
export async function getListingForEdit(databaseId) {
  const authToken = (await cookies()).get("authToken")?.value;
  if (!authToken) throw new Error("Unauthorized");

  const query = `
    query GetListingForEdit($id: ID!) {
      ccrlisting(id: $id, idType: DATABASE_ID) {
        databaseId
        title
        content
        featuredImage { node { databaseId sourceUrl } }
        attachedMedia { nodes { databaseId sourceUrl } }
        author { node { databaseId } }
        listingdata {
          addressStreet addressCity addressState addressZipCode
          phoneNumber businessEmail websiteUrl videoUrl socialUrl
          hoursMonday hoursTuesday hoursWednesday hoursThursday
          hoursFriday hoursSaturday hoursSunday
        }
        directoryTypes {
          nodes {
            slug
          }
        }
        ccrlistingcategories {
          nodes {
            slug
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query, variables: { id: databaseId } }),
    });

    const json = await res.json();
    await handleGraphQLError(json);
    return json.data?.ccrlisting || null;
  } catch (error) {
    console.error("Get Listing For Edit Error:", error);
    return null;
  }
}

/**
 * Helper to map payload to ACF format.
 */
function mapPayloadToAcf(payload) {
  const ld = payload.listingdata || {};
  return {
    address_street: payload.addressStreet || ld.addressStreet || "",
    address_city: payload.addressCity || ld.addressCity || "",
    address_state: payload.addressState || ld.addressState || "",
    address_zip_code: payload.addressZipCode || ld.addressZipCode || "",
    phone_number: payload.phoneNumber || ld.phoneNumber || "",
    business_email: payload.businessEmail || ld.businessEmail || "",
    website_url: payload.websiteUrl || ld.websiteUrl || "",
    video_url: payload.videoUrl || ld.videoUrl || "",
    social_url: ld.socialUrl || payload.socialUrl || "",
    hours_monday: ld.hoursMonday || payload.hoursMonday || "",
    hours_tuesday: ld.hoursTuesday || payload.hoursTuesday || "",
    hours_wednesday: ld.hoursWednesday || payload.hoursWednesday || "",
    hours_thursday: ld.hoursThursday || payload.hoursThursday || "",
    hours_friday: ld.hoursFriday || payload.hoursFriday || "",
    hours_saturday: ld.hoursSaturday || payload.hoursSaturday || "",
    hours_sunday: ld.hoursSunday || payload.hoursSunday || "",
    ccrlistingcategories: payload.categories || [],
  };
}

/**
 * Server Action to update an existing user listing.
 */
export async function updateUserListing(databaseId, payload) {
  const viewer = await getViewer();
  if (!viewer) throw new Error("Unauthorized");

  const listing = await getListingForEdit(databaseId);
  if (!listing || listing.author?.node?.databaseId !== viewer.databaseId) {
    throw new Error("You do not have permission to edit this listing.");
  }

  const query = `
    mutation UpdateUserListing($input: UpdateCcrlistingInput!) {
      updateCcrlisting(input: $input) {
        ccrlisting {
          databaseId
          directoryTypes { nodes { slug } }
          ccrlistingcategories { nodes { slug } }
        }
      }
    }
  `;

  const authToken = (await cookies()).get("authToken")?.value;
  const acfData = mapPayloadToAcf(payload);

  const variables = {
    input: {
      id: databaseId,
      title: payload.title,
      content: payload.content,
      featuredImageId: payload.featuredImageId,
      listingDataJson: JSON.stringify(acfData),
      directoryTypes: payload.selectedDirectoryType
        ? { append: false, nodes: [{ slug: payload.selectedDirectoryType }] }
        : { append: false, nodes: [] },
      ccrlistingcategories: payload.selectedCategories?.length > 0
        ? { append: false, nodes: payload.selectedCategories.map(slug => ({ slug })) }
        : { append: false, nodes: [] }
    },
  };

  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
      "User-Agent": "CCR-NextJS-Frontend/1.0"
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);

  revalidatePath("/dashboard/listings");
  revalidatePath("/directory", "layout");
  return { success: true };
}

/**
 * Server Action to delete a user's listing.
 */
export async function deleteUserListing(listingId) {
  const viewer = await getViewer();
  if (!viewer) throw new Error("Unauthorized");

  const listing = await getListingForEdit(listingId);
  if (!listing || listing.author?.node?.databaseId !== viewer.databaseId) {
    throw new Error("You do not have permission to delete this listing.");
  }

  const mutation = `
    mutation DeleteUserListing($id: ID!) {
      deleteCcrlisting(input: { id: $id }) { deletedId }
    }
  `;

  const authToken = (await cookies()).get("authToken")?.value;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query: mutation, variables: { id: listingId } }),
    });

    const json = await res.json();
    await handleGraphQLError(json);

    revalidatePath("/dashboard/listings");
    revalidatePath("/directory", "layout");
    return { success: true };
  } catch (error) {
    console.error("Delete Listing Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to update an existing user review.
 */
export async function updateUserReview(reviewId, formData) {
  const authToken = (await cookies()).get("authToken")?.value;
  if (!authToken) return { success: false, error: "Not authenticated" };

  const mutation = `
    mutation UpdateReview($input: UpdateCcrreviewInput!) {
      updateCcrreview(input: $input) {
        ccrreview { id content reviewFields { starRating } }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            id: reviewId,
            starRating: String(formData.rating),
            content: formData.content,
          },
        },
      }),
    });

    const json = await res.json();
    await handleGraphQLError(json);

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update Review Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to submit a bug report to Gravity Forms.
 */
export async function submitBugReport(formData) {
  const mutation = `
    mutation SubmitBugReport($input: SubmitGfFormInput!) {
      submitGfForm(input: $input) {
        confirmation { message }
        errors { message }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            id: 10,
            fieldValues: [
              { id: 1, value: formData.name },
              { id: 4, value: formData.pageUrl },
              { id: 3, value: formData.description },
            ],
          },
        },
      }),
    });

    const json = await res.json();
    if (json.errors || json.data?.submitGfForm?.errors?.length > 0) {
      const errorMsg = json.errors ? json.errors[0].message : json.data.submitGfForm.errors[0].message;
      throw new Error(errorMsg);
    }

    return { success: true };
  } catch (error) {
    console.error("Bug Report Submission Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Server Action to submit a new business listing to Gravity Forms (Form ID: 11).
 */
export async function submitListing(formData) {
  const authToken = (await cookies()).get("authToken")?.value;
  const mutation = `
    mutation SubmitListing($input: SubmitGfFormInput!) {
      submitGfForm(input: $input) {
        confirmation { message }
        errors { message }
      }
    }
  `;

  try {
    const headers = { 
      "Content-Type": "application/json",
      "User-Agent": "CCR-NextJS-Frontend/1.0"
    };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            id: 11,
            fieldValues: [
              { id: 1, value: formData.businessName },
              { id: 3, value: formData.city },
              { id: 4, value: formData.state },
              { id: 5, value: formData.zipCode },
              { id: 7, value: formData.priceRange || "" },
              { id: 8, value: formData.phoneNumber },
              { id: 9, value: formData.businessEmail },
              { id: 10, value: formData.websiteUrl },
              { id: 11, value: formData.videoUrl },
              { id: 12, value: formData.socialUrl },
              { id: 13, value: formData.hoursMonday },
              { id: 14, value: formData.hoursWednesday },
              { id: 15, value: formData.hoursTuesday },
              { id: 16, value: formData.hoursThursday },
              { id: 17, value: formData.hoursSaturday },
              { id: 18, value: formData.hoursFriday },
              { id: 19, value: formData.hoursSunday },
              { id: 20, value: formData.businessDescription },
              { id: 21, value: formData.streetAddress },
              { id: 22, value: formData.directoryType },
              { 
                id: 29, 
                value: Array.isArray(formData.categories) ? formData.categories.join(', ') : formData.categories 
              },
              ...(formData.featuredImage ? [{ id: 27, value: formData.featuredImage }] : []),
              ...(formData.galleryImages ? [{ id: 28, value: formData.galleryImages }] : []),
            ],
          },
        },
      }),
    });

    const json = await res.json();
    if (json.errors || json.data?.submitGfForm?.errors?.length > 0) {
      const errorMsg = json.errors ? json.errors[0].message : json.data.submitGfForm.errors[0].message;
      throw new Error(errorMsg);
    }

    revalidatePath("/directory", "layout");
    return { success: true };
  } catch (error) {
    console.error("Submit Listing Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Server Action to handle business registration via Gravity Form ID: 7.
 */
export async function registerBusiness(fieldValues) {
  const mutation = `
    mutation RegisterBusiness($input: SubmitGfFormInput!) {
      submitGfForm(input: $input) {
        confirmation { message }
        errors { id message }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query: mutation, variables: { input: { id: 7, fieldValues } } }),
    });

    const json = await res.json();
    if (json.errors || json.data?.submitGfForm?.errors?.length > 0) {
      if (json.data?.submitGfForm?.errors?.length > 0) {
        const gfError = json.data.submitGfForm.errors[0];
        throw new Error(`Field ID ${gfError.id} failed: ${gfError.message}`);
      } else {
        throw new Error(json.errors[0].message);
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Register Business Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Helper: AI-Powered Image Moderation (Sightengine)
 */
async function moderateImage(file) {
  const sightengineUser = process.env.SIGHTENGINE_API_USER;
  const sightengineSecret = process.env.SIGHTENGINE_API_SECRET;

  if (!sightengineUser || !sightengineSecret) return;

  const moderationFormData = new FormData();
  moderationFormData.append("media", file);
  moderationFormData.append("models", "nudity-2.0,gore");
  moderationFormData.append("api_user", sightengineUser);
  moderationFormData.append("api_secret", sightengineSecret);

  try {
    const modRes = await fetch("https://api.sightengine.com/1.0/check.json", {
      method: "POST",
      headers: {
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: moderationFormData,
    });

    const modJson = await modRes.json();
    if (modJson.status === "success") {
      const nudity = modJson.nudity?.explicit ?? 0;
      const gore = modJson.gore?.prob ?? 0;
      if (nudity > 0.5 || gore > 0.5) {
        throw new Error("Upload rejected: Image violates our safety guidelines.");
      }
    }
  } catch (error) {
    if (error.message.includes("safety guidelines")) throw error;
    console.error("Moderation API error:", error);
  }
}

/**
 * Helper: Server-Side Image Validation
 */
function validateImage(file) {
  const maxSize = 2 * 1024 * 1024; // 2MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (file.size > maxSize) {
    throw new Error("File too large. Maximum size is 2MB.");
  }
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, and WEBP are allowed.");
  }
}

/**
 * Server Action to upload raw image files directly to the WordPress REST API.
 */
export async function uploadWPImage(formData, postId = null) {
  const authToken = (await cookies()).get("authToken")?.value;
  if (!authToken) throw new Error("Unauthorized: Must be logged in to upload files.");

  const file = formData.get("file");
  if (!file) throw new Error("No file provided");

  await moderateImage(file);
  validateImage(file);

  const wpFormData = new FormData();
  wpFormData.append("file", file, file.name);
  if (postId) wpFormData.append("post", postId);

  const baseUrl = GRAPHQL_URL.replace("/graphql", "");
  const res = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
    method: "POST",
    headers: { 
      Authorization: `Bearer ${authToken}`,
      "User-Agent": "CCR-NextJS-Frontend/1.0"
    },
    body: wpFormData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Image upload failed");
  return data.id;
}

/**
 * Server Action to delete an attachment from WordPress REST API.
 */
export async function deleteWPMedia(attachmentId) {
  const authToken = (await cookies()).get("authToken")?.value;
  if (!authToken) throw new Error("Unauthorized: Must be logged in to delete files.");

  const baseUrl = GRAPHQL_URL.replace("/graphql", "");
  const res = await fetch(`${baseUrl}/wp-json/wp/v2/media/${attachmentId}?force=true`, {
    method: "DELETE",
    headers: { 
      Authorization: `Bearer ${authToken}`,
      "User-Agent": "CCR-NextJS-Frontend/1.0"
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Image deletion failed");
  return { success: true };
}

/**
 * Server Action to fetch blog posts from WordPress.
 */
export async function getBlogPosts() {
  const query = `
    query GetBlogPosts {
      posts(first: 100, where: { status: PUBLISH }) {
        nodes {
          databaseId title slug excerpt
          featuredImage { node { sourceUrl } }
          categories { nodes { name slug } }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 },
    });

    const json = await res.json();
    return json.data?.posts?.nodes || [];
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
}

/**
 * Server Action to fetch a single blog post by its slug from WordPress.
 */
export async function getBlogPostBySlug(slug) {
  const query = `
    query GetPostBySlug($id: ID!) {
      post(id: $id, idType: SLUG) {
        title content date
        featuredImage { node { sourceUrl altText } }
        categories { nodes { name } }
        seo { title metaDesc }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query, variables: { id: slug } }),
      next: { revalidate: 60 },
    });

    const json = await res.json();
    return json.data?.post || null;
  } catch (error) {
    console.error("Error fetching blog post by slug:", error);
    return null;
  }
}

/**
 * Server Action to fetch recent listings for the blog sidebar.
 */
export async function getSidebarListings() {
  const query = `
    query GetSidebarListings {
      ccrlistings(first: 4, where: { orderby: { field: DATE, order: DESC } }) {
        nodes {
          databaseId title slug
          featuredImage { node { sourceUrl } }
          directoryTypes { nodes { name } }
          reviews { nodes { reviewFields { starRating } } }
        }
      }
    }
  `;

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query }),
      next: { revalidate: 60 },
    });

    const json = await res.json();
    return json.data?.ccrlistings?.nodes || [];
  } catch (error) {
    console.error("Error fetching sidebar listings:", error);
    return [];
  }
}

/**
 * Submits the "Claim Listing" form to Gravity Forms via GraphQL.
 */
export async function submitClaimForm(formData) {
  const formId = 12;
  const mutation = `
    mutation SubmitClaimForm($input: SubmitGfFormInput!) {
      submitGfForm(input: $input) {
        errors { message }
        confirmation { message }
      }
    }
  `;

  const variables = {
    input: {
      id: formId,
      fieldValues: [
        { id: 1, value: formData.fullName || '' },
        { id: 6, value: formData.phone || '' },
        { id: 7, emailValues: { value: formData.email || '' } },
        { id: 3, value: formData.details || '' },
        { id: 8, value: formData.listingTitle || 'Unknown Title' },
        { id: 9, value: formData.listingSlug || 'unknown-slug' },
      ],
    },
  };

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ query: mutation, variables }),
    });

    const json = await res.json();
    if (json.errors) return { success: false, message: json.errors[0].message };
    if (json.data?.submitGfForm?.errors?.length > 0) {
      return { success: false, message: json.data.submitGfForm.errors[0].message };
    }
    return { success: true };
  } catch (error) {
    console.error("Claim Form Error:", error);
    return { success: false, message: "A network error occurred." };
  }
}

/**
 * Server Action to request a password reset email from WordPress.
 */
export async function requestPasswordReset(usernameOrEmail) {
  const query = `
    mutation SendPasswordReset($username: String!) {
      sendPasswordResetEmail(input: {username: $username}) {
        user {
          databaseId
          email
        }
      }
    }
  `;

  try {
    const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({
        query,
        variables: { username: usernameOrEmail },
      }),
      cache: 'no-store',
    });

    const json = await res.json();
    
    if (json.errors) {
      return { success: false, error: json.errors[0].message };
    }

    return { success: true };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

/**
 * Server Action to handle Google Login via the custom WordPress REST endpoint.
 */
export async function handleGoogleLogin(credential) {
  try {
    // Convert your GraphQL URL to the new custom REST route
    const backendUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL.replace('/graphql', '/wp-json/ccr/v1/google-login');

    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        "User-Agent": "CCR-NextJS-Frontend/1.0"
      },
      body: JSON.stringify({ token: credential }),
    });

    const data = await res.json();

    if (data.success && data.authToken) {
      const cookieStore = await cookies();
      cookieStore.set('authToken', data.authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      return { success: true };
    } else {
      return { success: false, error: data.message || 'Google login failed on the server.' };
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    return { success: false, error: 'Network error during Google login.' };
  }
}
