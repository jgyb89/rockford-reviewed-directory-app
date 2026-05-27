"use client";

import { forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";
import styles from "./SeoIntro.module.css";

const SeoIntro = forwardRef((props, ref) => {
  const localWrapperRef = useRef(null);
  const cardRef = useRef(null);
  const graphicsTrackRef = useRef(null);

  useEffect(() => {
    let mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 901px)",
        isMobile: "(max-width: 900px)",
      },
      (context) => {
        let { isDesktop } = context.conditions;

        if (isDesktop) {
          // DESKTOP AXIS: Infinite scroll moving vertically top-to-bottom
          gsap.fromTo(
            graphicsTrackRef.current,
            { yPercent: -50, xPercent: 0 },
            {
              yPercent: 0,
              xPercent: 0,
              ease: "none",
              repeat: -1,
              duration: 20,
            }
          );
        } else {
          // MOBILE AXIS: Infinite scroll moving horizontally left-to-right
          // Animating xPercent from -50% up to 0% shifts the line continuously to the right
          gsap.fromTo(
            graphicsTrackRef.current,
            { xPercent: -50, yPercent: 0 },
            {
              xPercent: 0,
              yPercent: 0,
              ease: "none",
              repeat: -1,
              duration: 15, // Shorter timeline track duration for standard mobile swipe speed
            }
          );
        }
      }
    );

    return () => mm.revert(); // Automatically handles full animation cleanup on unmount/resize
  }, []);

  const setRefs = (el) => {
    localWrapperRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div ref={setRefs} className={styles.stickyWrapper}>
      <div ref={cardRef} className={styles.flashCard}>
        <div className={styles.contentMaxWidth}>
          <div className={styles.splitGrid}>
            
            {/* LEFT COLUMN: Text narrative content */}
            <div className={styles.leftTextColumn}>
              <div className={styles.headlineMaskContainer}>
                <h2 className="breeze-text">Cape Coral Reviewed: Local Reviews, Businesses & Community Guides</h2>
              </div>
              <p className="breeze-text">
                Looking for the best and most popular Cape Coral businesses, restaurants, services, and local spots? Cape Coral Reviewed helps residents, visitors, and business owners like you connect through real reviews, local recommendations, honest business spotlights, and true community-driven guides.
              </p>
              <p className="breeze-text">
                From restaurants and coffee shops to home services, wellness providers, events, contractors, and small businesses, we make it easier to discover—and trust—what’s worth your time here in Cape Coral, Florida.
              </p>
            </div>

            {/* RIGHT COLUMN: Responsive Marquee Container Window */}
            <div className={styles.rightGraphicsColumn}>
              <div ref={graphicsTrackRef} className={styles.graphicsTrack}>
                {/* Duplicated arrays array loops to enforce a flawless canvas loop frame reset */}
                {[1, 2, 3, 4, 1, 2, 3, 4].map((index, i) => (
                  <div key={i} className={styles.mockListingCard}>
                    <div className={styles.cardImageStub}></div>
                    <div className={styles.cardContentContainer}>
                      <div className={styles.cardTitleLineStub}></div>
                      <div className={styles.starsRowStub}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={styles.miniStar}>★</span>
                        ))}
                      </div>
                      <div className={styles.cardBodyLineStub}></div>
                      <div className={styles.cardBodyLineStubShort}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

SeoIntro.displayName = "SeoIntro";
export default SeoIntro;
