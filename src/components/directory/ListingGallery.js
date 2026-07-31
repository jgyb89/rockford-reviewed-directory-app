"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import styles from "./ListingGallery.module.css";

export default function ListingGallery({ featuredImage, galleryImages = [] }) {
  const displayImages = useMemo(() => {
    const images = [featuredImage, ...galleryImages].filter(Boolean);
    return images.length > 0 ? images : ["/placeholder-image.jpg"];
  }, [featuredImage, galleryImages]);
  const [activeImage, setActiveImage] = useState(displayImages[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Navigation functions (wrapped in useCallback so they don't trigger unnecessary re-renders)
  const goToNext = useCallback(
    (e) => {
      if (e) e.stopPropagation(); // Prevents the click from bubbling up and closing the modal
      setActiveImage((prev) => {
        const currentIndex = displayImages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % displayImages.length;
        return displayImages[nextIndex];
      });
    },
    [displayImages],
  );

  const goToPrev = useCallback(
    (e) => {
      if (e) e.stopPropagation();
      setActiveImage((prev) => {
        const currentIndex = displayImages.indexOf(prev);
        const prevIndex =
          (currentIndex - 1 + displayImages.length) % displayImages.length;
        return displayImages[prevIndex];
      });
    },
    [displayImages],
  );

  // Handle Escape, Left, Right keys, and body scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowRight") {
        goToNext();
      } else if (e.key === "ArrowLeft") {
        goToPrev();
      }
    };

    if (isLightboxOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Prevent background scrolling while modal is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup event listener and overflow on unmount or state change
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isLightboxOpen, goToNext, goToPrev]);

  const closeLightbox = () => setIsLightboxOpen(false);

  return (
    <div className={styles["listing-gallery"]}>
      {/* Main Image */}
      <div
        className={`${styles["listing-gallery__main"]} ${styles["listing-gallery__main--clickable"]}`}
        onClick={() => setIsLightboxOpen(true)}
      >
        <Image
          src={activeImage}
          alt="Listing gallery image"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
      </div>

      {/* Thumbnails */}
      {displayImages.length > 1 && (
        <div className={styles["listing-gallery__thumbnails"]}>
          {displayImages.map((img, index) => (
            <button
              key={index}
              className={`${styles["listing-gallery__thumbnail"]} ${
                activeImage === img
                  ? styles["listing-gallery__thumbnail--active"]
                  : ""
              }`}
              onClick={() => setActiveImage(img)}
              type="button"
            >
              <Image
                src={img}
                alt={`Gallery thumbnail ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className={styles["lightbox-overlay"]} onClick={closeLightbox}>
          <button
            className={styles["lightbox-close"]}
            onClick={closeLightbox}
            aria-label="Close image"
          >
            &times;
          </button>

          {/* Conditional Navigation Arrows (only show if there is more than 1 image) */}
          {displayImages.length > 1 && (
            <>
              <button
                className={`${styles["lightbox-arrow"]} ${styles["lightbox-arrow--left"]}`}
                onClick={goToPrev}
                aria-label="Previous image"
              >
                &#10094;
              </button>

              <button
                className={`${styles["lightbox-arrow"]} ${styles["lightbox-arrow--right"]}`}
                onClick={goToNext}
                aria-label="Next image"
              >
                &#10095;
              </button>
            </>
          )}

          <div
            className={styles["lightbox-content"]}
            onClick={(e) => e.stopPropagation()} // Prevent clicking the image from closing the modal
          >
            <Image
              src={activeImage}
              alt="Full screen listing image"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
