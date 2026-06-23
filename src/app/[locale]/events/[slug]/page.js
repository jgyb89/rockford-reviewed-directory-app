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
import FavoriteButton from "@/components/directory/FavoriteButton";
import ShareButton from "@/components/directory/ShareButton";
import { expandRecurringEvents } from "@/lib/eventUtils";
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

const formatEventbriteDateRange = (startStr, endStr) => {
  if (!startStr) return { dateString: "Date TBA", timeString: "" };
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  if (isNaN(start.getTime())) return { dateString: startStr, timeString: "" };

  const timeOpts = { hour: "numeric", minute: "2-digit", hour12: true };
  const dateOpts = {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  };

  const startTime = new Intl.DateTimeFormat("en-US", timeOpts).format(start);
  const startDate = new Intl.DateTimeFormat("en-US", dateOpts).format(start);

  if (!end || isNaN(end.getTime())) {
    return { dateString: startDate, timeString: startTime };
  }

  const endTime = new Intl.DateTimeFormat("en-US", timeOpts).format(end);
  const endDate = new Intl.DateTimeFormat("en-US", dateOpts).format(end);

  // Same Day
  if (startDate === endDate) {
    return { dateString: startDate, timeString: `${startTime} - ${endTime}` };
  }

  // Different Days
  return { 
    dateString: `${startDate} – ${endDate}`, 
    timeString: `${startTime} to ${endTime}`
  };
};

export default async function SingleEventPage({ params }) {
  const { slug, locale } = await params;
  const event = await getEventBySlug(slug);
  const currentUser = await getViewer();

  const initialIsFavorite =
    currentUser?.userData?.favoriteListings?.nodes?.some(
      (n) => n.databaseId === event?.databaseId,
    ) || false;

  if (!event) {
    return (
      <main
        style={{ padding: "4rem 2rem", textAlign: "center", minHeight: "60vh" }}
      >
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
    .filter((e) => (e.status === "PUBLISH" || e.status === "publish") && e.databaseId !== event.databaseId)
    .filter((e) => {
      const startStr = e.eventDetails?.startDateTime || e.date;
      const endStr = e.eventDetails?.endDateTime || startStr;
      const endDate = new Date(endStr.replace(" ", "T"));

      // Ensure currently ongoing events are still recommended
      return endDate >= now;
    })
    .slice(0, 3);

  const { title, content, featuredImage, eventDetails } = event;
  const imageUrl = formatImageUrl(featuredImage?.node?.sourceUrl);

  let rawStartDate =
    eventDetails?.startDateTime ||
    eventDetails?.startDate ||
    eventDetails?.start_date;
  let rawEndDate =
    eventDetails?.endDateTime ||
    eventDetails?.endDate ||
    eventDetails?.end_date;

  const isRecurring = eventDetails?.isRecurring;
  if (isRecurring && eventDetails?.recurrenceRule) {
    const virtuals = expandRecurringEvents([event]); // Transposes to the single next occurrence
    if (virtuals.length > 0) {
      // Replace with the immediate next occurrence
      rawStartDate = virtuals[0].eventDetails?.startDateTime;
      rawEndDate = virtuals[0].eventDetails?.endDateTime;
    }
  }

  const { dateString, timeString } = formatEventbriteDateRange(rawStartDate, rawEndDate);

  const venueName = eventDetails?.venueName || "Venue TBA";
  const rawPrice = eventDetails?.price || "";
  const isFree = !rawPrice || rawPrice.toLowerCase() === 'free' || rawPrice === '0' || rawPrice === '$0';
  const ticketUrl = eventDetails?.ticketUrl || eventDetails?.ticket_url;
  const hasTicketUrl = Boolean(ticketUrl);

  const price =
    rawPrice && rawPrice.toLowerCase() !== "free" && !rawPrice.startsWith("$")
      ? `$${rawPrice}`
      : rawPrice || "Free";

  const addressObj = eventDetails?.eventAddress;
  const addressString = addressObj?.streetAddress || addressObj?.address || "";

  return (
    <>
      <main
        style={{
          backgroundColor: "#fdfdfd",
          minHeight: "100vh",
          paddingBottom: "100px",
        }}
      >
        {/* Full-width Blurred Hero Backdrop */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "45vh",
            backgroundColor: "#111",
            overflow: "hidden",
          }}
        >
          {imageUrl && (
            <>
              <Image
                src={imageUrl}
                alt=""
                fill
                style={{
                  objectFit: "cover",
                  opacity: 0.3,
                  filter: "blur(20px)",
                  transform: "scale(1.1)",
                }}
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
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 2vw" }}
        >
          <div
            style={{
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <BackButton locale={locale} fallback="/events" />
            <div style={{ display: "flex", gap: "1rem" }}>
              <FavoriteButton
                listingId={event.databaseId}
                initialIsFavorite={initialIsFavorite}
                currentUser={currentUser}
                label="Favorite"
              />
              <ShareButton
                title={title}
                text={`Check out ${title} on Cape Coral Reviewed!`}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "4rem",
              flexWrap: "wrap",
              alignItems: "flex-start",
            }}
          >
            {/* Left Column */}
            <div style={{ flex: "1 1 60%", minWidth: "300px" }}>
              <h1
                style={{
                  fontSize: "3.5rem",
                  fontWeight: "800",
                  color: "#111",
                  marginBottom: "1.5rem",
                  lineHeight: "1.1",
                  fontFamily: "var(--font-heading)",
                }}
              >
                {title}
              </h1>

              <div
                style={{
                  height: "1px",
                  backgroundColor: "#eaeaea",
                  width: "100%",
                  marginBottom: "2.5rem",
                }}
              />

              <section className="listing-card">
                <h2 className="listing-card__title">
                  <span className="material-symbols-outlined">info</span>
                  About this event
                </h2>
                {content ? (
                  <div
                    className="listing-card__text"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(content),
                    }}
                  />
                ) : (
                  <p className="listing-card__text">
                    No additional details provided.
                  </p>
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
                <div
                  style={{
                    height: "300px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "1px solid #eaeaea",
                    position: "relative",
                    marginTop: "1.5rem",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  >
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
                  <h3 className="review-list__header">
                    Discussion ({event.commentCount || 0})
                  </h3>
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
            <div
              style={{
                flex: "1 1 30%",
                minWidth: "300px",
                position: "sticky",
                top: "2rem",
              }}
            >
              <section
                className="listing-card"
                style={{
                  padding: "2rem",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                  border: "1px solid #eaeaea",
                }}
              >
                <h2 className="listing-card__title">
                  <span className="material-symbols-outlined">event</span>
                  Event Details
                </h2>

                {isRecurring && (
                  <div style={{ marginBottom: "1rem" }}>
                    <span style={{ 
                      display: "inline-block", backgroundColor: "#e6f4ea", color: "#137333", 
                      padding: "0.25rem 0.75rem", borderRadius: "16px", fontSize: "0.85rem", fontWeight: "600" 
                    }}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1rem", verticalAlign: "text-bottom", marginRight: "4px" }}>update</span>
                      Recurring Event
                    </span>
                  </div>
                )}

                <div
                  className="listing-card__item"
                  style={{ alignItems: "flex-start", gap: '0.75rem' }}
                >
                  <span className="material-symbols-outlined listing-card__icon" style={{ marginTop: '2px' }}>
                    calendar_today
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span
                      className="listing-card__text"
                      style={{ fontWeight: "600", fontSize: '1.05rem', color: '#1a1a1a', lineHeight: '1.2' }}
                    >
                      {dateString}
                    </span>
                    {timeString && (
                      <span style={{ fontSize: '0.95rem', color: '#555', fontWeight: '500' }}>
                        {timeString}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className="listing-card__item"
                  style={{ alignItems: "center", marginBottom: "1.5rem" }}
                >
                  <span className="material-symbols-outlined listing-card__icon">
                    sell
                  </span>
                  <span
                    className="listing-card__text"
                    style={{ fontSize: "1.5rem", fontWeight: "700" }}
                  >
                    {price}
                  </span>
                </div>

                <div
                  style={{
                    paddingTop: "1.5rem",
                    borderTop: "1px solid #e2e8f0",
                  }}
                >
                  {hasTicketUrl ? (
                    <a
                      href={ticketUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="listing-primary-btn"
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        padding: "1.2rem",
                        borderRadius: "8px",
                        fontSize: "1.1rem",
                        border: "none",
                        cursor: "pointer",
                        textDecoration: "none",
                      }}
                    >
                      {isFree ? "Register / RSVP" : "Buy Tickets"}
                    </a>
                  ) : (
                    <button
                      className="listing-primary-btn"
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "center",
                        padding: "1.2rem",
                        borderRadius: "8px",
                        fontSize: "1.1rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Save Event
                    </button>
                  )}
                </div>
              </section>
            </div>
          </div>

          {/* Recommended Events */}
          {recommendedEvents.length > 0 && (
            <div
              style={{
                marginTop: "4rem",
                paddingTop: "2rem",
                borderTop: "1px solid #eaeaea",
              }}
            >
              <h2
                style={{
                  fontSize: "2rem",
                  fontWeight: "700",
                  marginBottom: "2rem",
                  color: "#111",
                  fontFamily: "var(--font-heading)",
                }}
              >
                Other events you may like
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "2rem",
                }}
              >
                {recommendedEvents.map((recEvent) => (
                  <EventCard
                    key={recEvent.databaseId}
                    event={recEvent}
                    locale={locale}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
