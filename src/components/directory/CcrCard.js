"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { getLocalizedUrl } from "@/lib/constants";
import styles from "./CcrCard.module.css";
import heartStyles from '@/components/common/HeartButton.module.css';
import { toggleFavoriteListing, getCurrentViewer } from '@/lib/actions';
import LoginModal from '@/components/auth/LoginModal';
import { formatImageUrl } from "@/lib/formatImageUrl";

export default function CcrCard({ listing, currentUser: propCurrentUser, locale = 'en' }) {
  const [currentUser, setCurrentUser] = useState(propCurrentUser);
  const [isFavorite, setIsFavorite] = useState(false);
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
    if (propCurrentUser) {
      const favorited = propCurrentUser?.userData?.favoriteListings?.nodes?.some(
        node => node.databaseId === listing.databaseId
      ) || false;
      setIsFavorite(favorited);
    }
  }, [propCurrentUser, listing.databaseId]);

  useEffect(() => {
    if (typeof window !== "undefined" && document.cookie.includes("hasSession=true")) {
      async function fetchUser() {
        try {
          const viewer = await getCurrentViewer();
          if (viewer) {
            setCurrentUser(viewer);
            const favorited = viewer.userData?.favoriteListings?.nodes?.some(
              node => node.databaseId === listing.databaseId
            ) || false;
            setIsFavorite(favorited);
          }
        } catch (err) {
          console.error("Failed to check auth in CcrCard:", err);
        }
      }
      fetchUser();
    }
  }, [listing.databaseId]);

  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  if (!listing) return null;

  const { title, slug, featuredImage } = listing;
  const listingdata = listing.listingdata || {};

  const listingUrl = getLocalizedUrl(`/listing/${slug}`, locale);

  // Image handling
  const imageUrl = formatImageUrl(featuredImage?.node?.sourceUrl);
  const imageAlt = featuredImage?.node?.altText || title;

  // Author data
  const authorNode = listing?.author?.node;
  const authorName = authorNode?.name || 'Business Owner';
  const authorImage = authorNode?.customAvatar?.customAvatar?.node?.sourceUrl || authorNode?.avatar?.url || '/placeholder-avatar.jpg';
  
  // Transition: Use user-level featured status
  // Note: if my ACF user field group is named something other than userData in GraphQL, please swap out that key
  const isFeatured = !!authorNode?.userData?.isFeaturedUser;
  const isVerified = isFeatured; 

  // Rating calculation from the new ACF structure
  const reviewNodes = listing.reviews?.nodes || [];
  const reviewCount = reviewNodes.length;
  const averageRating = reviewCount > 0 
    ? (reviewNodes.reduce((acc, curr) => acc + (Number.parseFloat(curr.reviewFields?.starRating) || 0), 0) / reviewCount).toFixed(1)
    : "0.0";

  return (
    <>
      <div 
        className={styles['ccr-card']} 
        style={{ position: 'relative', zIndex: toastMessage ? 50 : 1 }}
      >
        <div className={styles['ccr-card__image-wrapper']}>
          {isFeatured && <div className={styles['ccr-card__badge']}>Featured</div>}
          <Link href={listingUrl} className={styles['ccr-card__image-link']} tabIndex="-1" aria-hidden="true">
            <Image
              src={imageUrl}
              alt={imageAlt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={styles['ccr-card__image']}
              priority={false}
            />
          </Link>
          {/* Author Avatar Overlay */}
          <div className={`${styles['ccr-card__author-wrapper']} ${isVerified ? styles['ccr-card__author-wrapper--verified'] : ''}`}>
            <div className={styles['ccr-card__author-img-container']}>
              <Image 
                src={authorImage} 
                alt={authorName} 
                fill 
                style={{ objectFit: 'cover' }} 
                sizes="54px"
              />
            </div>
            {isVerified && (
              <div className={styles['ccr-card__author-badge']} title="Verified Owner">
                <span className="material-symbols-outlined" style={{ fontSize: '11px', fontWeight: 'bold' }}>check</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles['ccr-card__content']}>
          <Link href={listingUrl} className={styles['ccr-card__header-link']}>
            <h3 className={styles['ccr-card__title']}>
              {title}
            </h3>
          </Link>

          <div className={styles['ccr-card__rating']}>
            {Array.from({ length: 5 }).map((_, i) => {
              const val = i + 1;
              const numRating = Number.parseFloat(averageRating);
              if (numRating >= val) {
                return (
                  <span key={i} className="material-symbols-outlined" style={{ fontSize: "18px", color: "#e94f37", fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                );
              } else if (numRating >= val - 0.5) {
                return (
                  <span key={i} className="material-symbols-outlined" style={{ fontSize: "18px", color: "#e94f37", fontVariationSettings: "'FILL' 1" }}>
                    star_half
                  </span>
                );
              } else {
                return (
                  <span key={i} className="material-symbols-outlined" style={{ fontSize: "18px", color: "#e94f37", fontVariationSettings: "'FILL' 0" }}>
                    star
                  </span>
                );
              }
            })}
          </div>

          <div className={styles['ccr-card__footer']}>
            <div className={styles['ccr-card__footer-item']}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "16px" }}
              >
                rate_review
              </span>
              {reviewCount > 0 ? (
                <>{reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}</>
              ) : (
                <>Be the first to <Link href={listingUrl} style={{ textDecoration: 'underline', color: '#e94f37' }}>review</Link></>
              )}
            </div>

            <div style={{ position: 'relative', display: 'inline-block' }}>
              <button
                className={`${heartStyles['heart-btn']} ${isFavorite ? heartStyles.active : ''}`}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                disabled={isUpdating}
                style={{ position: 'relative', zIndex: 10, opacity: isUpdating ? 0.6 : 1 }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={async (e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  if (!listing.databaseId) {
                    alert("Listing data is incomplete.");
                    return;
                  }
                  
                  if (!currentUser) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                  
                  setIsUpdating(true);
                  
                  // Optimistic UI update
                  const newFavoriteState = !isFavorite;
                  setIsFavorite(newFavoriteState);
                  setToastMessage(newFavoriteState ? "Added to favorite" : "Removed from favorite");
                  setTimeout(() => setToastMessage(""), 3000);

                  // Fire Server Action
                  const result = await toggleFavoriteListing(listing.databaseId);
                  
                  // Revert UI if server fails
                  if (!result.success) {
                    setIsFavorite(!newFavoriteState);
                    console.error(result.error || result.message);
                  }
                  
                  setIsUpdating(false);
                }}
              >
                <span ref={heartRef} className={`material-symbols-outlined ${heartStyles['heart-icon']}`}>
                  favorite
                </span>
              </button>
              {toastMessage && (
                <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px', backgroundColor: '#000', color: '#fff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.8rem', whiteSpace: 'nowrap', zIndex: 50 }}>
                  {toastMessage}
                  <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '5px', borderStyle: 'solid', borderColor: '#000 transparent transparent transparent' }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Suspense fallback={null}>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      </Suspense>
    </>
  );
}

CcrCard.propTypes = {
  listing: PropTypes.shape({
    databaseId: PropTypes.number,
    title: PropTypes.string,
    slug: PropTypes.string,
    featuredImage: PropTypes.shape({
      node: PropTypes.shape({
        sourceUrl: PropTypes.string,
        altText: PropTypes.string,
      }),
    }),
    listingdata: PropTypes.object,
    directoryTypes: PropTypes.shape({
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          slug: PropTypes.string,
        })
      ),
    }),
    reviews: PropTypes.shape({
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          reviewFields: PropTypes.shape({
            starRating: PropTypes.string,
          }),
        })
      ),
    }),
    author: PropTypes.shape({
      node: PropTypes.shape({
        name: PropTypes.string,
        userData: PropTypes.object,
        customAvatar: PropTypes.object,
        avatar: PropTypes.shape({
          url: PropTypes.string,
        }),
      }),
    }),
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string,
    userData: PropTypes.shape({
      favoriteListings: PropTypes.shape({
        nodes: PropTypes.arrayOf(
          PropTypes.shape({
            databaseId: PropTypes.number,
          })
        ),
      }),
    }),
  }),
};
