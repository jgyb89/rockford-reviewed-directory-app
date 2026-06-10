// src/components/events/EventCommentManager.js
"use client";

import { useState, useEffect, Suspense } from "react";
import PropTypes from "prop-types";
import LoginModal from "@/components/auth/LoginModal";
import EventCommentModal from "./EventCommentModal";
import { getCurrentViewer } from "@/lib/actions";

export default function EventCommentManager({ currentUser: propCurrentUser, eventId, eventSlug, locale = "en" }) {
  const [currentUser, setCurrentUser] = useState(propCurrentUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(propCurrentUser);
  }, [propCurrentUser]);

  useEffect(() => {
    if (typeof window !== "undefined" && document.cookie.includes("hasSession=true")) {
      async function fetchUser() {
        try {
          const viewer = await getCurrentViewer();
          if (viewer) {
            setCurrentUser(viewer);
          }
        } catch (err) {
          console.error("Failed to fetch current user:", err);
        }
      }
      fetchUser();
    }
  }, []);

  const handleWriteCommentClick = () => {
    if (currentUser) {
      setIsCommentModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  return (
    <>
      <button 
        style={{
          backgroundColor: "#111",
          color: "#fff",
          border: "none",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          borderRadius: "8px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}
        onClick={handleWriteCommentClick}
      >
        <span className="material-symbols-outlined">add_comment</span>
        Post a Comment
      </button>

      <Suspense fallback={null}>
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          locale={locale}
        />
      </Suspense>

      <EventCommentModal 
        eventId={eventId}
        eventSlug={eventSlug}
        isOpen={isCommentModalOpen} 
        onClose={() => setIsCommentModalOpen(false)} 
        currentUser={currentUser}
      />
    </>
  );
}

EventCommentManager.propTypes = {
  currentUser: PropTypes.object,
  eventId: PropTypes.number,
  eventSlug: PropTypes.string,
  locale: PropTypes.string,
};
