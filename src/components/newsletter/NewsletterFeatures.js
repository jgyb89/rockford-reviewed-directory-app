import React from "react";

export default function NewsletterFeatures() {
  const features = [
    {
      icon: "calendar_today",
      title: "Cape Coral Events & Things to Do",
      body: "We aggregate the best local vibe in Cape Coral—from the Cape Coral Farmers Market to live music at local waterfront bars, so you never miss a weekend beat."
    },
    {
      icon: "business",
      title: "Honest Local Business Reviews",
      body: "Looking for the best seafood in Cape Coral or a reliable plumber? We feature top-rated pros and authentic reviews for local services."
    },
    {
      icon: "loyalty",
      title: "SWFL Community News & Alerts",
      body: "Stay ahead of city changes, hurricane season tips, and neighborhood growth updates affecting Lee County and Cape Coral residents."
    }
  ];

  return (
    <section style={{ backgroundColor: "#f8f9fa", padding: "4rem 1.5rem" }}>
      <div 
        style={{ 
          maxWidth: "1200px", 
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2.5rem"
        }}
      >
        {features.map((feature, index) => (
          <div 
            key={index} 
            style={{ 
              backgroundColor: "#fff", 
              padding: "2rem", 
              borderRadius: "12px", 
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              border: "1px solid #eaeaea",
              textAlign: "center"
            }}
          >
            <div 
              style={{ 
                width: "60px", 
                height: "60px", 
                margin: "0 auto 1.5rem", 
                backgroundColor: "#fff5f3", // faint brand red
                borderRadius: "50%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                color: "#e94f37" // brand red
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>
                {feature.icon}
              </span>
            </div>
            <h3 
              style={{ 
                fontSize: "1.25rem", 
                fontWeight: "700", 
                color: "#111", 
                marginBottom: "1rem",
                fontFamily: "var(--font-heading)" 
              }}
            >
              {feature.title}
            </h3>
            <p style={{ color: "#666", lineHeight: "1.6", margin: 0 }}>
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
