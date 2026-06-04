"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EventCard from "@/components/events/EventCard";
import LoginModal from "@/components/auth/LoginModal";
import { getLocalizedUrl } from "@/lib/constants";

export default function EventsClient({ events, currentUser, locale }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const router = useRouter();

  const handleCreateClick = () => {
    if (currentUser) {
      router.push(getLocalizedUrl("/events/create", locale));
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{ padding: "4rem 2rem", backgroundColor: "#f8f9fa", textAlign: "center", borderBottom: "1px solid #eaeaea" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: "800", marginBottom: "1rem" }}>Cape Coral Events</h1>
        <p style={{ fontSize: "1.2rem", color: "#666", maxWidth: "600px", margin: "0 auto 2rem auto" }}>
          Discover what&apos;s happening around town or share your own upcoming event with the community.
        </p>
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
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
        >
          Create New Event
        </button>
      </section>

      {/* Grid Section */}
      <div style={{ maxWidth: "1600px", margin: "3rem auto", padding: "0 2vw" }}>
        {events.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
            {events.map((event) => (
              <EventCard key={event.databaseId} event={event} locale={locale} />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#666" }}>
            <h2>No events found.</h2>
            <p>Check back later or submit a new event!</p>
          </div>
        )}
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}
