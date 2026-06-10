import React from "react";

export default function NewsletterTestimonial() {
  return (
    <section style={{ backgroundColor: "#f8f9fa", padding: "6rem 1.5rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", textAlign: "center" }}>
        
        <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", marginBottom: "3rem", fontFamily: "var(--font-heading)" }}>
          What Your Neighbors Are Saying
        </h2>

        <div style={{ position: "relative" }}>
          <span 
            className="material-symbols-outlined" 
            style={{ 
              fontSize: "4rem", 
              color: "#e2e8f0", 
              position: "absolute", 
              top: "-2rem", 
              left: "50%", 
              transform: "translateX(-50%)",
              zIndex: 0
            }}
          >
            format_quote
          </span>
          
          <blockquote style={{ margin: 0, position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: "1.5rem", color: "#333", fontStyle: "italic", lineHeight: "1.6", marginBottom: "2rem" }}>
              "I used to spend hours figuring out what to do on the weekends. Now I just wait for the Friday email from Cape Coral Reviewed!"
            </p>
            <footer>
              <strong style={{ fontSize: "1.1rem", color: "#111", display: "block" }}>Sarah M.</strong>
              <span style={{ fontSize: "1rem", color: "#666" }}>SW Cape Coral</span>
            </footer>
          </blockquote>
        </div>

      </div>
    </section>
  );
}
