"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./ListingGallery.module.css";

export default function ListingGallery({ featuredImage, galleryImages = [] }) {
  const images = [featuredImage, ...galleryImages].filter(Boolean);
  
  // Fallback if no images
  const displayImages = images.length > 0 ? images : ["/placeholder-image.jpg"];
  const [activeImage, setActiveImage] = useState(displayImages[0]);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Handle Escape key and body scrolling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
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
  }, [isLightboxOpen]);

  const closeLightbox = () => setIsLightboxOpen(false);

  return (
    <div className={styles['listing-gallery']}>
      {/* Main Image */}
      <div 
        className={`${styles['listing-gallery__main']} ${styles['listing-gallery__main--clickable']}`}
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
        <div className={styles['listing-gallery__thumbnails']}>
          {displayImages.map((img, index) => (
            <button
              key={index}
              className={`${styles['listing-gallery__thumbnail']} ${
                activeImage === img ? styles['listing-gallery__thumbnail--active'] : ""
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
        <div className={styles['lightbox-overlay']} onClick={closeLightbox}>
          <button 
            className={styles['lightbox-close']} 
            onClick={closeLightbox}
            aria-label="Close image"
          >
            &times;
          </button>
          
          <div 
            className={styles['lightbox-content']}
            onClick={(e) => e.stopPropagation()} // Prevent clicking the image from closing the modal
          >
            <Image
              src={activeImage}
              alt="Full screen listing image"
              fill
              style={{ objectFit: "contain" }} // Ensures the image is not cropped
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
