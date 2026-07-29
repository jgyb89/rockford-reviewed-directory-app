import React from "react";
import EventsClient from "./EventsClient";
import EventsSEO from "@/components/events/EventsSEO"; // Import the new SEO component
import { getEvents } from "@/lib/graphql/events";
import { getCurrentViewer } from "@/lib/actions";
import { BASE_URL } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: "Rockford Events | Local Community Happenings",
    description: "Discover upcoming events, festivals, concerts, and community gatherings in Rockford. Submit your own local events to be featured.",
    openGraph: {
      title: "Rockford Events",
      description: "Discover upcoming events, festivals, concerts, and community gatherings in Rockford.",
      url: `${BASE_URL}${locale === "es" ? "/es/events" : "/events"}`,
      type: "website",
    },
  };
}

export default async function EventsPage({ params }) {
  const { locale } = await params;
  // Fetch data concurrently for performance
  const [events, currentUser] = await Promise.all([
    getEvents(),
    getCurrentViewer()
  ]);

  return (
    <main style={{ backgroundColor: "#fdfdfd", minHeight: "100vh" }}>
      {/* Interactive Client Feed */}
      <EventsClient events={events} currentUser={currentUser} locale={locale} />
      
      {/* New SEO Animated Content Block */}
      <EventsSEO />
    </main>
  );
}
