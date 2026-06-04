import React from "react";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { getEventBySlug } from "@/lib/graphql/events";
import { formatImageUrl } from "@/lib/formatImageUrl";
import BackButton from "@/components/blog/BackButton";

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

// Helper function for clean Date & Time formatting
const formatEventDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  
  // Fallback just in case the date string is malformed
  if (isNaN(date.getTime())) return dateString; 

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

export default async function SingleEventPage({ params }) {
  const { slug, locale } = await params;
  const event = await getEventBySlug(slug);

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

  const { title, content, featuredImage, eventDetails } = event;
  const imageUrl = formatImageUrl(featuredImage?.node?.sourceUrl);
  
  // Check multiple field name variations (startDateTime, startDate, start_date)
  const rawStartDate = eventDetails?.startDateTime || eventDetails?.startDate || eventDetails?.start_date;
  const rawEndDate = eventDetails?.endDateTime || eventDetails?.endDate || eventDetails?.end_date;
  
  const startDate = formatEventDateTime(rawStartDate);
  const endDate = formatEventDateTime(rawEndDate);
  
  const venueName = eventDetails?.venueName || "TBA";
  const price = eventDetails?.price || "Free";
  const ticketUrl = eventDetails?.ticketUrl || eventDetails?.ticket_url;

  const addressObj = eventDetails?.eventAddress;
  // ACF might return the raw string under 'streetAddress' or 'address' depending on the GraphQL API mapping
  const addressString = addressObj?.streetAddress || addressObj?.address || "";

  return (
    <main style={{ backgroundColor: "#fdfdfd", minHeight: "100vh", paddingBottom: "4rem" }}>
      {/* Hero Banner */}
      <div style={{ position: "relative", width: "100%", height: "40vh", backgroundColor: "#333" }}>
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={title}
            fill
            style={{ objectFit: "cover", opacity: 0.6 }}
            priority
          />
        )}
        <div style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
          color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.8)", padding: "2rem", textAlign: "center"
        }}>
          <h1 style={{ fontSize: "3rem", fontWeight: "800", marginBottom: "1rem" }}>{title}</h1>
          <div style={{ fontSize: "1.2rem", fontWeight: "500", display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            {startDate && (
               <span><span className="material-symbols-outlined" style={{ verticalAlign: "middle", fontSize: "20px" }}>calendar_today</span> {startDate}</span>
            )}
            <span><span className="material-symbols-outlined" style={{ verticalAlign: "middle", fontSize: "20px" }}>location_on</span> {venueName}</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 2vw", display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <BackButton locale={locale} fallback="/events" />
        </div>

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {/* Main Content */}
          <div style={{ flex: "1 1 60%", backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
            <h2 style={{ fontSize: "2rem", marginBottom: "1.5rem", borderBottom: "2px solid #eaeaea", paddingBottom: "0.5rem" }}>Event Details</h2>
            
            {content ? (
              <div
                style={{ lineHeight: "1.8", fontSize: "1.1rem", color: "#444" }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
              />
            ) : (
              <p>No additional details provided.</p>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ flex: "1 1 30%", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            {/* Quick Info Card */}
            <div style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", borderBottom: "2px solid #eaeaea", paddingBottom: "0.5rem" }}>At a Glance</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <strong>Start:</strong> <br />{startDate || "TBA"}
                </div>
                {endDate && (
                  <div>
                    <strong>End:</strong> <br />{endDate}
                  </div>
                )}
                <div>
                  <strong>Venue:</strong> <br />{venueName}
                </div>
                {addressString && (
                  <div>
                    <strong>Address:</strong> <br />{addressString}
                  </div>
                )}
                <div>
                  <strong>Price:</strong> <br />{price}
                </div>
              </div>

              {ticketUrl && (
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    marginTop: "2rem",
                    backgroundColor: "#e94f37",
                    color: "#fff",
                    textAlign: "center",
                    padding: "1rem",
                    borderRadius: "100px",
                    fontWeight: "600",
                    textDecoration: "none",
                    transition: "opacity 0.2s"
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = 0.9}
                  onMouseLeave={(e) => e.target.style.opacity = 1}
                >
                  Get Tickets
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
