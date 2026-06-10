"use client";

import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { toggleFavoriteListing, getCurrentViewer } from '@/lib/actions';
import heartStyles from '@/components/common/HeartButton.module.css';

export default function FavoriteButton({ listingId, initialIsFavorite = false, currentUser: propCurrentUser, label = "Favorite", iconOnly = false }) {
  const [currentUser, setCurrentUser] = useState(propCurrentUser);
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [toastMessage, setToastMessage] = useState(null);
  const heartRef = useRef(null);

  const handleMouseEnter = () => {
    if (!heartRef.current) return;
    gsap.to(heartRef.current, {
      rotation: 30,
      scale: 1.3,
      duration: 1,
      overwrite: "auto",
      transformOrigin: "center 60%",
      ease: "back.out(3)"
    });
  };

  const handleMouseLeave = () => {
    if (!heartRef.current) return;
    gsap.to(heartRef.current, {
      rotation: 0,
      scale: 1,
      duration: 1,
      overwrite: "auto",
      transformOrigin: "center 60%",
      ease: "back.out(3)"
    });
  };

  useEffect(() => {
    setCurrentUser(propCurrentUser);
  }, [propCurrentUser]);

  useEffect(() => {
    if (typeof window !== "undefined" && document.cookie.includes("hasSession=true")) {
      async function checkAuth() {
        try {
          const viewer = await getCurrentViewer();
          setCurrentUser(viewer);
          if (viewer) {
            const favorited = viewer.userData?.favoriteListings?.nodes?.some(
              (n) => n.databaseId === listingId
            ) || false;
            setIsFavorite(favorited);
          }
        } catch (err) {
          console.error("Failed to check auth in FavoriteButton:", err);
        }
      }
      checkAuth();
    }
  }, [listingId]);

  const handleToggle = async () => {
    if (!currentUser) {
      setToastMessage("Please log in to favorite.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    const newState = !isFavorite;
    setIsFavorite(newState); // Optimistic instant update

    // Trigger Toast
    setToastMessage(newState ? "Added to favorites!" : "Removed from favorites");
    setTimeout(() => setToastMessage(null), 3000);

    try {
      const result = await toggleFavoriteListing(listingId);
      
      if (!result.success) {
        throw new Error(result.error || "Failed to sync with server.");
      }
    } catch (error) {
      setIsFavorite(!newState); // Revert the UI if the server fails
      setToastMessage(error.message || "Error saving favorite.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button 
        className={`${iconOnly ? heartStyles['heart-btn'] : 'listing-action-btn'} ${isFavorite ? heartStyles.active : ''}`} 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleToggle();
        }}
        style={iconOnly ? { position: 'relative', zIndex: 10 } : { display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        <span ref={heartRef} className={`material-symbols-outlined ${heartStyles['heart-icon']}`}>
          favorite
        </span>
        {!iconOnly && <span className="listing-action-btn__text">{label}</span>}
      </button>

      {toastMessage && (
        <div style={{ position: 'absolute', top: '120%', left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '0.5rem 1rem', borderRadius: '6px', fontSize: '0.8rem', whiteSpace: 'nowrap', zIndex: 50, pointerEvents: 'none' }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
