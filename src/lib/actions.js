// src/lib/actions.js
"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { loginUser, getViewer } from "./auth";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

/**
 * Global helper to cleanly execute authenticated GraphQL mutations.
 */
export async function fetchGraphQL(query, variables = {}, requireAuth = true) {
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "CCR-NextJS-Frontend/1.0",
  };

  if (requireAuth) {
    const token = (await cookies()).get("authToken")?.value;
    if (!token) throw new Error("Not authenticated");
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      console.error(`HTTP Error inside fetchGraphQL: status ${res.status}`);
      return { errors: [{ message: `HTTP Error: ${res.status}` }] };
    }
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error(`Unexpected content-type inside fetchGraphQL: ${contentType}`);
      return { errors: [{ message: "Invalid JSON response" }] };
    }
    const json = await res.json();
    await handleGraphQLError(json);
    return json;
  } catch (error) {
    console.error("GraphQL fetch failed inside fetchGraphQL:", error);
    return { errors: [{ message: error.message }] };
  }
}

/**
 * Global helper to handle Gravity Forms submissions.
 */
async function submitGravityForm(formId, fieldValues, requireAuth = false) {
  const mutation = `
    mutation SubmitGfForm($input: SubmitGfFormInput!) {
      submitGfForm(input: $input) {
        confirmation { message }
        errors { id message }
      }
    }
  `;

  const json = await fetchGraphQL(
    mutation,
    { input: { id: formId, fieldValues } },
    requireAuth,
  );

  if (json.data?.submitGfForm?.errors?.length > 0) {
    throw new Error(json.data.submitGfForm.errors[0].message);
  }
  return { success: true };
}

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
        e.message?.includes("invalid_token"),
    );

    if (isTokenError) {
      const cookieStore = await cookies();
      cookieStore.set("authToken", "", { maxAge: 0 });
      cookieStore.set("hasSession", "", { maxAge: 0 });
      redirect("/login");
    }

    throw new Error(json.errors[0].message);
  }
}

/**
 * Server Action to update the user's profile.
 */
export async function updateUserProfile(formData) {
  try {
    const viewer = await getViewer();
    if (!viewer?.id) redirect("/login");

    const mutation = `
      mutation UpdateUserProfile($input: UpdateUserInput!) {
        updateUser(input: $input) {
          user {
            id firstName lastName
            customAvatar { customAvatar { node { sourceUrl } } }
            userData { phoneNumber websiteUrl emailVisibility }
          }
        }
      }
    `;

    const json = await fetchGraphQL(
      mutation,
      {
        input: {
          id: viewer.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber,
          websiteUrl: formData.websiteUrl,
          emailVisibility: formData.emailVisibility,
          ...(formData.avatarId && {
            customAvatar: Number.parseInt(formData.avatarId),
          }),
        },
      },
      true,
    );

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
  const mutation = `
    mutation DeleteReview($id: ID!) {
      deleteCcrreview(input: { id: $id }) { deletedId }
    }
  `;
  try {
    await fetchGraphQL(mutation, { id: reviewId }, true);
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
  try {
    const viewer = await getViewer();
    if (!viewer) throw new Error("Could not fetch viewer data");

    const currentFavorites =
      viewer.userData?.favoriteListings?.nodes.map((n) => n.databaseId) || [];
    const updatedFavorites = currentFavorites.filter(
      (id) => id.toString() !== listingId.toString(),
    );

    const mutation = `
      mutation UpdateUserFavorites($userId: ID!, $favorites: [Int]) {
        updateUser(input: { id: $userId, favoriteListings: $favorites }) {
          user { databaseId }
        }
      }
    `;

    await fetchGraphQL(
      mutation,
      { userId: viewer.id, favorites: updatedFavorites },
      true,
    );
    return { success: true };
  } catch (error) {
    console.error("Remove Favorite Error:", error);
    return { success: false, error: error.message };
  }
}

export async function toggleFavoriteListing(listingId) {
  try {
    const viewer = await getViewer();
    if (!viewer) throw new Error("Could not fetch viewer data");

    const currentFavorites =
      viewer.userData?.favoriteListings?.nodes?.map((n) => n.databaseId) || [];
    const listingDbId = Number.parseInt(listingId, 10);

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

    await fetchGraphQL(
      mutation,
      { userId: viewer.id, favorites: updatedFavorites },
      true,
    );
    revalidatePath("/directory");
    revalidatePath("/dashboard/favorites");
    return { success: true };
  } catch (error) {
    console.error("Toggle Favorite Error:", error);
    return {
      success: false,
      error: error.message || "Network error occurred.",
    };
  }
}

/**
 * Server Action to submit a user review.
 */
export async function submitUserReview(formData) {
  const mutation = `
    mutation CreateReview($input: CreateCcrreviewInput!) {
      createCcrreview(input: $input) {
        ccrreview {
          databaseId title content
          reviewFields { starRating }
        }
      }
    }
  `;

  try {
    await fetchGraphQL(
      mutation,
      {
        input: {
          title: formData.title || `Review for Listing #${formData.listingId}`,
          content: formData.content,
          starRating: String(formData.rating),
          relatedListing: [Number.parseInt(formData.listingId, 10)],
          status: "PUBLISH",
        },
      },
      true,
    );

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Submit Review Action Error:", error);
    return {
      success: false,
      message:
        error.message || "Network error occurred while submitting review.",
    };
  }
}

/**
 * Server Action to fetch a listing for editing.
 */
export async function getListingForEdit(databaseId) {
  const query = `
    query GetListingForEdit($id: ID!) {
      ccrlisting(id: $id, idType: DATABASE_ID) {
        databaseId title content
        featuredImage { node { databaseId sourceUrl } }
        attachedMedia { nodes { databaseId sourceUrl } }
        author { node { databaseId } }
        listingdata {
          addressStreet addressCity addressState addressZipCode
          phoneNumber businessEmail websiteUrl videoUrl socialUrl
          hoursMonday hoursTuesday hoursWednesday hoursThursday
          hoursFriday hoursSaturday hoursSunday
        }
        directoryTypes { nodes { slug } }
        ccrlistingcategories { nodes { slug } }
      }
    }
  `;

  try {
    const json = await fetchGraphQL(query, { id: databaseId }, true);
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
  try {
    const viewer = await getViewer();
    if (!viewer) throw new Error("Unauthorized");

    const listing = await getListingForEdit(databaseId);
    if (!listing || listing.author?.node?.databaseId !== viewer.databaseId) {
      throw new Error("You do not have permission to edit this listing.");
    }

    const mutation = `
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

    const acfData = mapPayloadToAcf(payload);

    await fetchGraphQL(
      mutation,
      {
        input: {
          id: databaseId,
          title: payload.title,
          content: payload.content,
          featuredImageId: payload.featuredImageId,
          listingDataJson: JSON.stringify(acfData),
          directoryTypes: payload.selectedDirectoryType
            ? {
                append: false,
                nodes: [{ slug: payload.selectedDirectoryType }],
              }
            : { append: false, nodes: [] },
          ccrlistingcategories:
            payload.selectedCategories?.length > 0
              ? {
                  append: false,
                  nodes: payload.selectedCategories.map((slug) => ({ slug })),
                }
              : { append: false, nodes: [] },
        },
      },
      true,
    );

    revalidatePath("/dashboard/listings");
    revalidatePath("/directory", "layout");
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to delete a user's listing.
 */
export async function deleteUserListing(listingId) {
  try {
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

    await fetchGraphQL(mutation, { id: listingId }, true);

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
  const mutation = `
    mutation UpdateReview($input: UpdateCcrreviewInput!) {
      updateCcrreview(input: $input) {
        ccrreview { id content reviewFields { starRating } }
      }
    }
  `;

  try {
    await fetchGraphQL(
      mutation,
      {
        input: {
          id: reviewId,
          starRating: String(formData.rating),
          content: formData.content,
        },
      },
      true,
    );

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
  try {
    await submitGravityForm(10, [
      { id: 1, value: formData.name },
      { id: 4, value: formData.pageUrl },
      { id: 3, value: formData.description },
    ]);
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
  try {
    await submitGravityForm(
      11,
      [
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
          value: Array.isArray(formData.categories)
            ? formData.categories.join(", ")
            : formData.categories,
        },
        ...(formData.featuredImage
          ? [{ id: 27, value: formData.featuredImage }]
          : []),
        ...(formData.galleryImages
          ? [{ id: 28, value: formData.galleryImages }]
          : []),
      ],
      false,
    ); // Usually listing submission doesn't strictly *require* auth but uses it if available

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
  try {
    await submitGravityForm(7, fieldValues);
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
        "User-Agent": "CCR-NextJS-Frontend/1.0",
      },
      body: moderationFormData,
    });

    const modJson = await modRes.json();
    if (modJson.status === "success") {
      const nudity = modJson.nudity?.explicit ?? 0;
      const gore = modJson.gore?.prob ?? 0;
      if (nudity > 0.5 || gore > 0.5) {
        throw new Error(
          "Upload rejected: Image violates our safety guidelines.",
        );
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
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

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
  if (!authToken)
    throw new Error("Unauthorized: Must be logged in to upload files.");

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
      "User-Agent": "CCR-NextJS-Frontend/1.0",
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
  if (!authToken)
    throw new Error("Unauthorized: Must be logged in to delete files.");

  const baseUrl = GRAPHQL_URL.replace("/graphql", "");
  const res = await fetch(
    `${baseUrl}/wp-json/wp/v2/media/${attachmentId}?force=true`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "User-Agent": "CCR-NextJS-Frontend/1.0",
      },
    },
  );

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
    const json = await fetchGraphQL(query, {}, false);
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
    const json = await fetchGraphQL(query, { id: slug }, false);
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
    const json = await fetchGraphQL(query, {}, false);
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
  try {
    await submitGravityForm(12, [
      { id: 1, value: formData.fullName || "" },
      { id: 6, value: formData.phone || "" },
      { id: 7, emailValues: { value: formData.email || "" } },
      { id: 3, value: formData.details || "" },
      { id: 8, value: formData.listingTitle || "Unknown Title" },
      { id: 9, value: formData.listingSlug || "unknown-slug" },
    ]);
    return { success: true };
  } catch (error) {
    console.error("Claim Form Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Submits the "Claim Listing" form to Gravity Forms via GraphQL.
 */
export async function submitContactForm(formData) {
  try {
    await submitGravityForm(14, [
      { id: 1, value: formData.firstName || "" },
      { id: 3, value: formData.lastName || "" },
      { id: 4, value: formData.email || "" },
      { id: 5, value: formData.phone || "" },
      { id: 6, value: formData.message || "" },
    ]);
    return { success: true };
  } catch (error) {
    console.error("Contact Form Error:", error);
    return { success: false, message: error.message };
  }
}

/**
 * Server Action to handle the Newsletter subscription via Gravity Form ID: 15.
 */
export async function submitNewsletterForm(formData) {
  const email = formData.get("email");

  if (!email) {
    return { success: false, error: "Email is required." };
  }

  const formId = 15;
  
  // CRITICAL: GraphQL Gravity Forms requires 'emailValues' for email fields, not just 'value'
  const fieldValues = [
    { 
      id: 1, 
      emailValues: { value: email } 
    }
  ];

  try {
    await submitGravityForm(formId, fieldValues);
    return { success: true };
  } catch (error) {
    console.error("Newsletter submission error:", error);
    return { success: false, error: error.message || "Failed to join the newsletter. Please try again." };
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
    await fetchGraphQL(query, { username: usernameOrEmail }, false);
    return { success: true };
  } catch (error) {
    console.error("Password reset request error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Server Action to handle Google Login via the custom WordPress REST endpoint.
 */
export async function handleGoogleLogin(credential) {
  try {
    // Convert your GraphQL URL to the new custom REST route
    const backendUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL.replace(
      "/graphql",
      "/wp-json/ccr/v1/google-login",
    );

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "CCR-NextJS-Frontend/1.0",
      },
      body: JSON.stringify({ token: credential }),
    });

    const data = await res.json();

    if (data.success && data.authToken) {
      const cookieStore = await cookies();
      cookieStore.set("authToken", data.authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
      cookieStore.set("hasSession", "true", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });
      return { success: true };
    } else {
      return {
        success: false,
        error: data.message || "Google login failed on the server.",
      };
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    return { success: false, error: "Network error during Google login." };
  }
}

/**
 * Server Action to fetch the current logged-in user's data.
 * This is safe to run client-side as it is a POST Server Action.
 */
export async function getCurrentViewer() {
  return await getViewer();
}

/**
 * Submit the Recommend a Business Form (Gravity Form ID 8)
 */
export async function submitRecommendationForm(formData) {
  const fieldValues = [
    { id: 8, value: formData.get("submitterName") || "" },
    { id: 1, value: formData.get("businessName") || "" },
    { id: 5, value: formData.get("businessAddress") || "" },
    { id: 4, emailValues: { value: formData.get("businessEmail") || "" } },
    { id: 6, value: formData.get("businessPhone") || "" },
    { id: 7, value: formData.get("additionalInfo") || "" },
  ];

  // Use the centralized Gravity Forms helper
  return submitGravityForm(8, fieldValues, false);
}

/**
 * Server Action to submit an Event comment using native WP comments.
 */
export async function submitEventComment(formData) {
  const mutation = `
    mutation CreateEventComment($input: CreateCommentInput!) {
      createComment(input: $input) {
        comment {
          id
          databaseId
        }
      }
    }
  `;

  try {
    await fetchGraphQL(
      mutation,
      {
        input: {
          commentOn: Number.parseInt(formData.eventId, 10),
          content: formData.content,
        },
      },
      true,
    );

    revalidatePath("/events", "layout");
    return { success: true };
  } catch (error) {
    console.error("Submit Event Comment Error:", error);
    return {
      success: false,
      message: error.message || "Network error occurred while submitting comment.",
    };
  }
}
