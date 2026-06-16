"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import LoginModal from "@/components/auth/LoginModal";
import { getLocalizedUrl } from "@/lib/constants";
import { EVENT_CATEGORIES } from "@/lib/constants/events";
import Link from "next/link";
import "./EventsClient.css";

const DISPLAY_CATEGORIES = [
  { name: "All", slug: "all", icon: "widgets" },
  ...EVENT_CATEGORIES,
];

const parseSafeDate = (dateStr) => {
  if (!dateStr) return new Date(0);
  return new Date(dateStr.replace(" ", "T"));
};

export default function EventsClient({ events, currentUser, locale }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState("all");

  const router = useRouter();

  const handleCreateClick = () => {
    if (currentUser) {
      router.push(getLocalizedUrl("/events/create", locale));
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const { eventsToday, eventsUpcoming, eventsFree, otherUpcomingEvents } =
    useMemo(() => {
      const today = new Date();
      const todayStr = today.toDateString();

      let filteredEvents = [...events];

      // Filter by active category slug
      if (activeCategorySlug !== "all") {
        filteredEvents = filteredEvents.filter((e) =>
          e.eventCategories?.nodes?.some(
            (cat) => cat.slug === activeCategorySlug,
          ),
        );
      }

      const todayArr = [];
      const upcomingArr = [];
      const freeArr = [];
      const otherArr = [];

      // Use a Set to track IDs and prevent an event appearing in multiple sections
      // Or if we want them to appear in multiple sections, we just let them.
      // The prompt says "group into distinct thematic rows". Eventbrite lets an event be in 'Today' and 'Free'. So we allow duplicates across rows.

      filteredEvents.forEach((e) => {
        const eDateStr = e.eventDetails?.startDateTime || e.date;
        if (!eDateStr) return;

        const eventDate = parseSafeDate(eDateStr);

        // Skip past events entirely unless they are today
        if (eventDate < today && eventDate.toDateString() !== todayStr) {
          return;
        }

        let categorized = false;

        // 1. Today
        if (eventDate.toDateString() === todayStr) {
          todayArr.push(e);
          categorized = true;
        }

        // 2. Upcoming
        else if (eventDate > today) {
          upcomingArr.push(e);
          categorized = true;
        }

        // 3. Free
        const price = e.eventDetails?.price?.toLowerCase();
        if (price === "free" || price === "0" || !price) {
          freeArr.push(e);
          categorized = true;
        }

        if (!categorized) {
          otherArr.push(e);
        }
      });

      // Sort chronologically
      const sortChronologically = (arr) =>
        arr.sort((a, b) => {
          const dateA = parseSafeDate(a.eventDetails?.startDateTime || a.date);
          const dateB = parseSafeDate(b.eventDetails?.startDateTime || b.date);
          return dateA.getTime() - dateB.getTime();
        });

      return {
        eventsToday: sortChronologically(todayArr),
        eventsUpcoming: sortChronologically(upcomingArr),
        eventsFree: sortChronologically(freeArr),
        otherUpcomingEvents: sortChronologically(otherArr),
      };
    }, [events, activeCategorySlug]);

  return (
    <div>
      {/* Hero Section */}
      <section
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.5rem 2rem",
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #eaeaea",
          maxWidth: "1600px",
          margin: "0 auto",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          style={{
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h1
            style={{
              textAlign: "left",
              fontSize: "2.5rem",
              fontWeight: "800",
              marginBottom: "0.5rem",
            }}
          >
            Cape Coral Events
          </h1>
          <p
            style={{
              fontSize: "1.2rem",
              color: "#666",
              maxWidth: "600px",
              margin: 0,
            }}
          >
            Discover what&apos;s happening around town or share your own
            upcoming event with the community.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          style={{
            backgroundColor: "#e94f37",
            color: "#fff",
            border: "none",
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            fontWeight: "600",
            borderRadius: "100px",
            cursor: "pointer",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
        >
          Create New Event
        </button>
      </section>

      {/* Main Layout */}
      <div
        style={{ maxWidth: "1440px", margin: "0 auto", padding: "2rem 2vw" }}
      >
        {/* Category Filter Bar */}
        <div className="category-filter-bar">
          {DISPLAY_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              className={`category-btn ${activeCategorySlug === cat.slug ? "active" : ""}`}
              onClick={() => setActiveCategorySlug(cat.slug)}
            >
              <span className="material-symbols-outlined">{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Feed Rows */}
        {eventsToday.length === 0 &&
          eventsUpcoming.length === 0 &&
          eventsFree.length === 0 &&
          otherUpcomingEvents.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 0",
                color: "#666",
                backgroundColor: "#fdfdfd",
                border: "1px dashed #eaeaea",
                borderRadius: "12px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "3rem",
                  color: "#ccc",
                  marginBottom: "1rem",
                }}
              >
                event_busy
              </span>
              <h2>No upcoming events found.</h2>
              <p>Try selecting a different category or check back later!</p>
            </div>
          )}

        {eventsToday.length > 0 && (
          <section>
            <h2 className="thematic-section-header">Going on Today</h2>
            <div className="event-discovery-grid">
              {eventsToday.slice(0, 8).map((event) => (
                <EventCard
                  key={`today-${event.databaseId}`}
                  event={event}
                  locale={locale}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </section>
        )}

        {eventsUpcoming.length > 0 && (
          <section>
            <h2 className="thematic-section-header">Upcoming Events</h2>
            <div className="event-discovery-grid">
              {eventsUpcoming.slice(0, 8).map((event) => (
                <EventCard
                  key={`upcoming-${event.databaseId}`}
                  event={event}
                  locale={locale}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </section>
        )}

        {eventsFree.length > 0 && (
          <section>
            <h2 className="thematic-section-header">Free Events</h2>
            <div className="event-discovery-grid">
              {eventsFree.slice(0, 8).map((event) => (
                <EventCard
                  key={`free-${event.databaseId}`}
                  event={event}
                  locale={locale}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </section>
        )}

        {/* Fallback for events that don't fit any bucket */}
        {otherUpcomingEvents.length > 0 && (
          <section>
            <h2 className="thematic-section-header">More Upcoming Events</h2>
            <div className="event-discovery-grid">
              {otherUpcomingEvents.slice(0, 16).map((event) => (
                <EventCard
                  key={`other-${event.databaseId}`}
                  event={event}
                  locale={locale}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
