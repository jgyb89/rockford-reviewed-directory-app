import PropTypes from "prop-types";
import { getListings } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import Script from "next/script";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import PaginatedFeed from "@/components/home/PaginatedFeed";
import CcrCard from "@/components/directory/CcrCard";
import HomepageInfo from "@/components/home/HomepageInfo";
import SunsetTransition from "@/components/home/SunsetTransition";
import BeachySeoStory from "@/components/home/BeachySeoStory";
import SeoCards from "@/components/home/SeoCards";
import { getEvents } from "@/lib/graphql/events";
import { expandRecurringEvents } from "@/lib/eventUtils";
import EventCard from "@/components/events/EventCard";
import { BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = {
  title: "Cape Coral Reviewed - Local Business Directory",
  description:
    "Looking for the best and most popular Cape Coral businesses, restaurants, services, and local spots? Cape Coral Reviewed helps residents, visitors, and business owners like you connect through real reviews, local recommendations, honest business spotlights, and true community-driven guides.",
  openGraph: {
    title: "Cape Coral Reviewed",
    description:
      "Looking for the best and most popular Cape Coral businesses, restaurants, services, and local spots? Cape Coral Reviewed helps residents, visitors, and business owners like you connect through real reviews, local recommendations, honest business spotlights, and true community-driven guides.",
    url: BASE_URL,
    siteName: "Cape Coral Reviewed",
    locale: "en_US",
    type: "website",
  },
};

export default async function HomePage({ params }) {
  const { locale } = await params;
  const listings = await getListings();

  // Strict filter: only listings where the author is featured
  const featuredListings = listings.filter(
    (listing) => listing.author?.node?.userData?.isFeaturedUser === true,
  );

  const popularListings = listings;

  const eventsResponse = await getEvents();
  const rawEvents = eventsResponse || [];
  const allEvents = expandRecurringEvents(rawEvents, 3);

  const today = new Date();
  const todayStr = today.toDateString();
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);

  const upcomingEvents = allEvents
    .filter((event) => {
      const rawDate = event.eventDetails?.startDateTime || event.date;
      if (!rawDate) return false;
      const eventDate = new Date(rawDate.replace(" ", "T"));

      // Skip past events entirely unless they are today
      if (eventDate < startOfToday && eventDate.toDateString() !== todayStr) {
        return false;
      }

      const isToday = eventDate.toDateString() === todayStr;
      const isWeekend =
        eventDate >= startOfToday && [0, 5, 6].includes(eventDate.getDay());

      return isToday || isWeekend;
    })
    .sort((a, b) => {
      const dateA = new Date(
        (a.eventDetails?.startDateTime || a.date).replace(" ", "T"),
      );
      const dateB = new Date(
        (b.eventDetails?.startDateTime || b.date).replace(" ", "T"),
      );
      return dateA - dateB;
    });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cape Coral Reviewed",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className={styles.main}>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <HeroSlideshow featuredListings={featuredListings} locale={locale} />

      {/* Main Content Layout - REPLACED WITH HORIZONTAL ROW */}
      <div className={styles.container}>
        {/* Popular Listings Section */}
        {popularListings && popularListings.length > 0 && (
          <PaginatedFeed
            title="Popular Near You"
            viewAllLink="/directory"
            viewAllText="View All Listings &rarr;"
            items={popularListings.map((listing) => (
              <CcrCard
                key={listing.databaseId}
                listing={listing}
                locale={locale}
              />
            ))}
          />
        )}

        {/* Upcoming Events Section */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <PaginatedFeed
            title="Upcoming Events"
            viewAllLink="/events"
            viewAllText="View All Events &rarr;"
            items={upcomingEvents.map((event) => (
              <EventCard key={event.id || event.databaseId} event={event} locale={locale} />
            ))}
          />
        )}
      </div>

      {/* Homepage Info Section */}
      <HomepageInfo />

      {/* Coastal Sunrise GSAP Journey & SEO Story */}
      <BeachySeoStory />

      <section
        style={{
          backgroundColor: "#ffffff",
          padding: "4rem 0",
          overflowX: "hidden",
        }}
      >
        <div className={styles.container}>
          <SeoCards />
        </div>
      </section>

      {/* Sunset Animation Transition */}
      <SunsetTransition />
    </main>
  );
}

HomePage.propTypes = {
  params: PropTypes.object.isRequired,
};
