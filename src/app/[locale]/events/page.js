import React from "react";
import EventsClient from "./EventsClient";
import { getEvents } from "@/lib/graphql/events";
import { getCurrentViewer } from "@/lib/actions";
import { BASE_URL } from "@/lib/constants";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return {
    title: "Cape Coral Events | Local Community Happenings",
    description: "Discover upcoming events, festivals, concerts, and community gatherings in Cape Coral. Submit your own local events to be featured.",
    openGraph: {
      title: "Cape Coral Events",
      description: "Discover upcoming events, festivals, concerts, and community gatherings in Cape Coral.",
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
      <EventsClient events={events} currentUser={currentUser} locale={locale} />
    </main>
  );
}
