// src/components/directory/ReviewActionManager.js
"use client";

import { useState, useEffect, Suspense } from "react";
import PropTypes from "prop-types";
import LoginModal from "@/components/auth/LoginModal";
import ReviewModal from "./ReviewModal";
import { getCurrentViewer } from "@/lib/actions";

export default function ReviewActionManager({ currentUser: propCurrentUser, listingId, listingSlug, dict = {}, locale = "en" }) {
  const [currentUser, setCurrentUser] = useState(propCurrentUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
          console.error("Failed to fetch current user in ReviewActionManager:", err);
        }
      }
      fetchUser();
    }
  }, []);

  const handleWriteReviewClick = () => {
    if (currentUser) {
      setIsReviewModalOpen(true);
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const t = dict?.listing || {};

  return (
    <>
      <button 
        className="listing-primary-btn" 
        onClick={handleWriteReviewClick}
      >
        <span className="material-symbols-outlined">rate_review</span>
        {t.writeReview || "Write a Review"}
      </button>

      <Suspense fallback={null}>
        <LoginModal 
          isOpen={isLoginModalOpen} 
          onClose={() => setIsLoginModalOpen(false)} 
          dict={dict}
          locale={locale}
        />
      </Suspense>

      <ReviewModal 
        listingId={listingId}
        listingSlug={listingSlug}
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        currentUser={currentUser}
      />
    </>
  );
}

ReviewActionManager.propTypes = {
  currentUser: PropTypes.object,
  listingId: PropTypes.number,
  listingSlug: PropTypes.string,
  dict: PropTypes.object,
  locale: PropTypes.string,
};
