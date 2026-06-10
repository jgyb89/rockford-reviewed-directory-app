import React from "react";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { getEventBySlug, getEvents } from "@/lib/graphql/events";
import { formatImageUrl } from "@/lib/formatImageUrl";
import BackButton from "@/components/blog/BackButton";
import EventMap from "@/components/events/EventMap";
import { getViewer } from "@/lib/auth";
import EventCommentManager from "@/components/events/EventCommentManager";
import EventCommentList from "@/components/events/EventCommentList";
import EventCard from "@/components/events/EventCard";
import EventActionBar from "@/components/events/EventActionBar";
import "../../listing/[slug]/ListingPage.css";
import "./EventPage.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found - Cape Coral Reviewed",
    };
  }

  const title = `${event.title} - Cape Coral Events`;
  const description = "Discover this upcoming event in Cape Coral.";
  const ogImage = formatImageUrl(event.featuredImage?.node?.sourceUrl);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

// Helper to mimic the clean Eventbrite date formatting
const formatEventbriteDateRange = (startStr, endStr) => {
  if (!startStr) return "Date TBA";
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  if (isNaN(start.getTime())) return startStr;

  const timeOpts = { hour: 'numeric', minute: '2-digit', hour12: true };
  const dateOpts = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };

  const startTime = new Intl.DateTimeFormat('en-US', timeOpts).format(start);
  const startDate = new Intl.DateTimeFormat('en-US', dateOpts).format(start);

  if (!end || isNaN(end.getTime())) {
    return `${startDate} • ${startTime}`;
  }

  const endTime = new Intl.DateTimeFormat('en-US', timeOpts).format(end);
  const endDate = new Intl.DateTimeFormat('en-US', dateOpts).format(end);

  // Same Day: Sat, Jul 11, 2026 • 10 AM - 2 PM
  if (startDate === endDate) {
    return `${startDate} • ${startTime} - ${endTime}`;
  }

  // Different Days: Thu, Jun 4, 2026 at 5 PM – Fri, Jun 5, 2026 at 10 AM
  return `${startDate} at ${startTime} – ${endDate} at ${endTime}`;
};

export default async function SingleEventPage({ params }) {
  const { slug, locale } = await params;
  const event = await getEventBySlug(slug);
  const currentUser = await getViewer();

  if (!event) {
    return (
      <main style={{ padding: "4rem 2rem", textAlign: "center", minHeight: "60vh" }}>
        <h1>Event Not Found</h1>
        <p>The event you are looking for does not exist or has been removed.</p>
        <div style={{ marginTop: "2rem" }}>
          <BackButton locale={locale} fallback="/events" />
        </div>
      </main>
    );
  }

  const allEvents = await getEvents();
  const now = new Date();
  const recommendedEvents = allEvents
    .filter(e => (e.status === "PUBLISH" || e.status === "publish") && e.databaseId !== event.databaseId)
    .filter(e => {
      const start = e.eventDetails?.startDateTime ? new Date(e.eventDetails.startDateTime) : new Date(e.date);
      return start >= now;
    })
    .slice(0, 3);

  const { title, content, featuredImage, eventDetails } = event;
  const imageUrl = formatImageUrl(featuredImage?.node?.sourceUrl);

  const rawStartDate = eventDetails?.startDateTime || eventDetails?.startDate || eventDetails?.start_date;
  const rawEndDate = eventDetails?.endDateTime || eventDetails?.endDate || eventDetails?.end_date;
  const cleanDateRange = formatEventbriteDateRange(rawStartDate, rawEndDate);
  
  const venueName = eventDetails?.venueName || "Venue TBA";
  const price = eventDetails?.price || "Free";
  const ticketUrl = eventDetails?.ticketUrl || eventDetails?.ticket_url;

  const addressObj = eventDetails?.eventAddress;
  const addressString = addressObj?.streetAddress || addressObj?.address || "";

  return (
    <>
      <main style={{ backgroundColor: "#fdfdfd", minHeight: "100vh", paddingBottom: "100px" }}>
        
        {/* Full-width Blurred Hero Backdrop */}
        <div style={{ position: "relative", width: "100%", height: "45vh", backgroundColor: "#111", overflow: "hidden" }}>
          {imageUrl && (
            <>
              <Image
                src={imageUrl}
                alt=""
                fill
                style={{ objectFit: "cover", opacity: 0.3, filter: "blur(20px)", transform: "scale(1.1)" }}
                priority
              />
              <Image
                src={imageUrl}
                alt={title}
                fill
                style={{ objectFit: "contain", zIndex: 1 }}
                priority
              />
            </>
          )}
        </div>

        {/* 1200px Container */}
        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 2vw" }}>
          <div style={{ marginBottom: "2rem" }}>
            <BackButton locale={locale} fallback="/events" />
          </div>

          <div style={{ display: "flex", gap: "4rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            
            {/* Left Column */}
            <div style={{ flex: "1 1 60%", minWidth: "300px" }}>
              <h1 style={{ fontSize: "3.5rem", fontWeight: "800", color: "#111", marginBottom: "1.5rem", lineHeight: "1.1", fontFamily: "var(--font-heading)" }}>
                {title}
              </h1>

              <div style={{ height: "1px", backgroundColor: "#eaeaea", width: "100%", marginBottom: "2.5rem" }} />

              <section className="listing-card">
                <h2 className="listing-card__title">
                  <span className="material-symbols-outlined">info</span>
                  About this event
                </h2>
                {content ? (
                  <div
                    className="listing-card__text"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
                  />
                ) : (
                  <p className="listing-card__text">No additional details provided.</p>
                )}
              </section>

              <section className="listing-card">
                <h2 className="listing-card__title">
                  <span className="material-symbols-outlined">location_on</span>
                  Location
                </h2>
                <div className="listing-card__item">
                  <span className="material-symbols-outlined listing-card__icon">
                    place
                  </span>
                  <div className="listing-card__text">
                    <strong>{venueName}</strong>
                    {addressString && <div>{addressString}</div>}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressString || venueName)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="listing-card__link"
                      style={{ display: "inline-block", marginTop: "0.5rem" }}
                    >
                      Show map
                    </a>
                  </div>
                </div>
                <div style={{ height: "300px", borderRadius: "12px", overflow: "hidden", border: "1px solid #eaeaea", position: "relative", marginTop: "1.5rem" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
                    <EventMap 
                      lat={addressObj?.latitude} 
                      lng={addressObj?.longitude} 
                      address={addressString || venueName} 
                    />
                  </div>
                </div>
              </section>

              <section id="reviews" className="listing-card">
                <div className="reviews-section-header">
                  <h3 className="review-list__header">Discussion ({event.commentCount || 0})</h3>
                  <EventCommentManager
                    eventId={event.databaseId}
                    eventSlug={slug}
                    currentUser={currentUser}
                    locale={locale}
                  />
                </div>
                <EventCommentList 
                  comments={event.comments} 
                  currentUser={currentUser}
                />
              </section>

            </div>

            {/* Right Column (Sticky) */}
            <div style={{ flex: "1 1 30%", minWidth: "300px", position: "sticky", top: "2rem" }}>
              <section className="listing-card" style={{ padding: "2rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", border: "1px solid #eaeaea" }}>
                <h2 className="listing-card__title">
                  <span className="material-symbols-outlined">event</span>
                  Event Details
                </h2>
                
                <div className="listing-card__item" style={{ alignItems: "center" }}>
                  <span className="material-symbols-outlined listing-card__icon">calendar_today</span>
                  <span className="listing-card__text" style={{ fontWeight: "600" }}>{cleanDateRange}</span>
                </div>

                <div className="listing-card__item" style={{ alignItems: "center", marginBottom: "1.5rem" }}>
                  <span className="material-symbols-outlined listing-card__icon">sell</span>
                  <span className="listing-card__text" style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                    {price}
                  </span>
                </div>

                <div style={{ paddingTop: "1.5rem", borderTop: "1px solid #e2e8f0" }}>
                  {ticketUrl ? (
                    <a
                      href={ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="listing-primary-btn"
                      style={{
                        display: "block",
                        textAlign: "center",
                        padding: "1.2rem",
                        borderRadius: "8px",
                        fontSize: "1.1rem"
                      }}
                    >
                      Reserve a spot
                    </a>
                  ) : (
                    <div style={{ textAlign: "center", color: "#666", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                      Tickets available at the door
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Recommended Events */}
          {recommendedEvents.length > 0 && (
            <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: "1px solid #eaeaea" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "2rem", color: "#111", fontFamily: "var(--font-heading)" }}>
                Other events you may like
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "2rem" }}>
                {recommendedEvents.map(recEvent => (
                  <EventCard key={recEvent.databaseId} event={recEvent} locale={locale} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <EventActionBar 
        eventId={event.databaseId} 
        title={title} 
        price={price} 
        ticketUrl={ticketUrl} 
        initialCurrentUser={currentUser} 
      />
    </>
  );
}
