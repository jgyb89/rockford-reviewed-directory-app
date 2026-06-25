"use server";

import { fetchGraphQL } from "../actions";
import { getViewer } from "../auth";
import { revalidatePath } from "next/cache";

const formatACFDate = (dateStr) => {
  if (!dateStr) return "";
  // Converts '2026-06-03T14:30' to '2026-06-03 14:30:00'
  return dateStr.replace("T", " ") + ":00";
};

const EVENT_FIELDS = `
  databaseId
  id
  slug
  title
  content
  status
  date
  commentCount
comments(first: 100, where: { status: "approve" }) {
    nodes {
      id
      databaseId
      content
      date
      author {
        node {
          name
          avatar { url }
        }
      }
    }
  }
  featuredImage { node { databaseId sourceUrl altText } }
  eventCategories { nodes { name slug } }
  eventDetails {
    isRecurring
    recurrenceRule
    startDateTime
    endDateTime
    venueName
    eventAddress {
      streetAddress
      city
      state
      postCode
      latitude
      longitude
    }
    price
    ticketUrl
  }
`;

export async function getEvents() {
  const query = `
    query GetEvents {
      events(first: 100, where: { stati: [PUBLISH] }) {
        nodes {
          ${EVENT_FIELDS}
        }
      }
    }
  `;
  try {
    const json = await fetchGraphQL(query, {}, false);
    return json.data?.events?.nodes || [];
  } catch (error) {
    console.error("Error fetching events");
    return [];
  }
}

export async function getEventBySlug(slug) {
  // Bypass the EventIdType enum by filtering the plural 'events' list by the slug (name)
  const query = `
    query GetEventBySlug($slug: String!) {
      events(where: { name: $slug }, first: 1) {
        nodes {
          ${EVENT_FIELDS}
        }
      }
    }
  `;

  const variables = { slug };

  try {
    // IMPORTANT: Pass 'false' as the third parameter so it doesn't require a JWT token
    const json = await fetchGraphQL(query, variables, false);
    // Return the first node from the filtered list, or null if not found
    return json?.data?.events?.nodes?.[0] || null;
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    return null;
  }
}

export async function getAuthEventBySlug(slug) {
  // Bypass the EventIdType enum by filtering the plural 'events' list by the slug (name)
  const query = `
    query GetAuthEventBySlug($slug: String!) {
      events(where: { name: $slug, stati: [PUBLISH, PENDING, DRAFT] }, first: 1) {
        nodes {
          ${EVENT_FIELDS}
        }
      }
    }
  `;

  const variables = { slug };

  try {
    // IMPORTANT: Pass 'true' as the third parameter so it requires a JWT token
    const json = await fetchGraphQL(query, variables, true);
    // Return the first node from the filtered list, or null if not found
    return json?.data?.events?.nodes?.[0] || null;
  } catch (error) {
    console.error("Error fetching auth event by slug:", error);
    return null;
  }
}

export async function getUserEvents() {
  try {
    const viewer = await getViewer();
    if (!viewer) throw new Error("Unauthorized");

    const query = `
      query GetUserEvents($author: Int!) {
        events(first: 100, where: { author: $author, stati: [PUBLISH, PENDING, DRAFT] }) {
          nodes {
            ${EVENT_FIELDS}
          }
        }
      }
    `;
    const json = await fetchGraphQL(query, { author: viewer.databaseId }, true);
    return json.data?.events?.nodes || [];
  } catch (error) {
    console.error("Error fetching user events:", error);
    return [];
  }
}

export async function createEventMutation(payload) {
  const acfData = {
    start_date: formatACFDate(payload.start_date),
    end_date: formatACFDate(payload.end_date),
    venue_name: payload.venue_name,
    event_address: payload.event_address?.address
      ? {
          address: payload.event_address.address,
          lat: payload.event_address.lat,
          lng: payload.event_address.lng,
        }
      : null,
    price: payload.price,
    ticket_url: payload.ticket_url,
    is_recurring: payload.is_recurring ? true : false,
    recurrence_rule: payload.recurrence_rule || '',
    _primary_category: payload.primaryCategory || '',
    _custom_tags: payload.customTags || [],
  };

  const mutation = `
    mutation CreateEvent($input: CreateEventInput!) {
      createEvent(input: $input) {
        event {
          id
          databaseId
          slug
        }
      }
    }
  `;

  try {
    const json = await fetchGraphQL(
      mutation,
      {
        input: {
          title: payload.title,
          content: payload.content,
          featuredImageId: payload.featuredImageId || null,
          eventDetailsJson: JSON.stringify(acfData),
        },
      },
      true,
    );

    const { revalidatePath } = require("next/cache");
    revalidatePath("/events");
    revalidatePath("/dashboard/events");
    return { success: true, data: json.data?.createEvent?.event };
  } catch (error) {
    console.error("Create Event Error:", error);
    return { success: false, message: error.message };
  }
}

export async function updateEventMutation(databaseId, payload) {
  const acfData = {
    start_date: formatACFDate(payload.start_date),
    end_date: formatACFDate(payload.end_date),
    venue_name: payload.venue_name,
    event_address: payload.event_address?.address
      ? {
          address: payload.event_address.address,
          lat: payload.event_address.lat,
          lng: payload.event_address.lng,
        }
      : null,
    price: payload.price,
    ticket_url: payload.ticket_url,
    is_recurring: payload.is_recurring ? true : false,
    recurrence_rule: payload.recurrence_rule || '',
    _primary_category: payload.primaryCategory || '',
    _custom_tags: payload.customTags || [],
  };

  const mutation = `
    mutation UpdateEvent($input: UpdateEventInput!) {
      updateEvent(input: $input) {
        event {
          id
          databaseId
          slug
        }
      }
    }
  `;

  try {
    const json = await fetchGraphQL(
      mutation,
      {
        input: {
          id: databaseId,
          title: payload.title,
          content: payload.content,
          featuredImageId: payload.featuredImageId || null,
          eventDetailsJson: JSON.stringify(acfData),
        },
      },
      true,
    );

    const { revalidatePath } = require("next/cache");
    revalidatePath("/events");
    revalidatePath("/dashboard/events");
    return { success: true, data: json.data?.updateEvent?.event };
  } catch (error) {
    console.error("Update Event Error:", error);
    return { success: false, message: error.message };
  }
}

export async function deleteEventMutation(databaseId) {
  const mutation = `
    mutation DeleteEvent($id: ID!) {
      deleteEvent(input: { id: $id }) {
        deletedId
      }
    }
  `;

  try {
    await fetchGraphQL(mutation, { id: databaseId }, true);
    revalidatePath("/events");
    revalidatePath("/dashboard/events");
    return { success: true };
  } catch (error) {
    console.error("Delete Event Error:", error);
    return { success: false, message: error.message };
  }
}
