"use client";

import React, { useState, useEffect } from "react";
import FavoriteButton from "@/components/directory/FavoriteButton";
import { getCurrentViewer } from "@/lib/actions";

export default function EventActionBar({ eventId, title, price, ticketUrl, initialCurrentUser }) {
  const [currentUser, setCurrentUser] = useState(initialCurrentUser);

  // Re-verify the current user on the client side if not explicitly provided
  useEffect(() => {
    if (!currentUser && typeof document !== "undefined" && document.cookie.includes("hasSession=true")) {
      getCurrentViewer().then((user) => {
        if (user) setCurrentUser(user);
      }).catch(console.error);
    }
  }, [currentUser]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing", error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Copy failed", error);
      }
    }
  };

  return (
    <div 
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        zIndex: 100,
        backgroundColor: "#fff",
        borderTop: "1px solid #e2e8f0",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.05)"
      }}
    >
      <div 
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "1rem 2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <div style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111" }}>
          {price || "Free"}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <FavoriteButton 
              listingId={eventId} 
              currentUser={currentUser} 
              label=""
            />
            
            <button
              onClick={handleShare}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "1px solid #eaeaea",
                backgroundColor: "#fdfdfd",
                color: "#111",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              title="Share"
              aria-label="Share"
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#f1f5f9"; e.currentTarget.style.borderColor = "#cbd5e1"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fdfdfd"; e.currentTarget.style.borderColor = "#eaeaea"; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>share</span>
            </button>
          </div>

          {ticketUrl ? (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="listing-primary-btn"
              >
                Tickets
              </a>
          ) : (
            <div style={{ padding: "0.75rem 2rem", backgroundColor: "#f8f9fa", borderRadius: "8px", color: "#666", fontWeight: "600", fontSize: "1rem" }}>
              Tickets at door
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
