import React from "react";
import Image from "next/image";

export default function NewsletterSneakPeek() {
  const issues = [
    {
      title: "Top 5 Waterfront Restaurants in Cape Coral",
      excerpt: "From fine dining at Tarpon Point to casual bites on the Caloosahatchee, discover the best spots to eat with a view.",
      image: "/stella-maries-newsletter.png"
    },
    {
      title: "Your Guide to the Cape Coral Coconut Festival",
      excerpt: "Everything you need to know about parking, live entertainment, and navigating Southwest Florida's favorite fall festival.",
      image: "/burrowing-owl-festival-newsletter.png"
    },
    {
      title: "The Best Bar Nights in Cape Coral",
      excerpt: "Looking for a fun night out? We cover the top spots for live music, craft cocktails, and great local vibes.",
      image: "/bar-night-newsletter.png"
    },
    {
      title: "Why You Need Local Life Insurance Experts",
      excerpt: "Protecting your family in SWFL. We highlight the top-rated life insurance agencies helping residents secure their future.",
      image: "/life-insurance-newsletter.png"
    },
    {
      title: "Cape Coral's Most Trusted Plumbers Reviewed",
      excerpt: "Don't let a leak ruin your weekend. Discover the most reliable and highly-reviewed local plumbing professionals.",
      image: "/trusted-plumber-newsletter.png"
    }
  ];

  return (
    <section style={{ backgroundColor: "#fff", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#666" }}>
            Recent Issues
          </span>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", marginTop: "0.5rem", fontFamily: "var(--font-heading)" }}>
            Look Inside the Newsletter
          </h2>
        </div>

        <div 
          style={{ 
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2.5rem"
          }}
        >
          {issues.map((issue, index) => (
            <div key={index} style={{ display: "flex", flexDirection: "column" }}>
              <div 
                style={{ 
                  width: "100%", 
                  aspectRatio: "16/9", 
                  backgroundColor: "#f1f5f9", 
                  borderRadius: "12px", 
                  marginBottom: "1.5rem",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <Image
                  src={issue.image}
                  alt={issue.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111", marginBottom: "0.75rem", lineHeight: "1.4" }}>
                {issue.title}
              </h3>
              
              <p style={{ color: "#4a4a4a", lineHeight: "1.6", marginBottom: "1.5rem", flexGrow: 1 }}>
                {issue.excerpt}
              </p>
              
              <div>
                <span 
                  style={{ 
                    fontSize: "0.9rem", 
                    fontWeight: "600", 
                    color: "#111", 
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem"
                  }}
                >
                  Read Preview
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>chevron_right</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
