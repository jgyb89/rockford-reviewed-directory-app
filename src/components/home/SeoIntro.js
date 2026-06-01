"use client";

import { forwardRef, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./SeoIntro.module.css";

// Card Images
import ItalianRestaurant from "../../../public/italian-restaurant.webp";
import MugsCheering from "../../../public/mugs-of-beer.webp";
import lawnMowing from "../../../public/lawn-mowing.webp";
import BoatRiding from "../../../public/boat-riding-on-wave.webp";
import BarNight from "../../../public/night-club-bar-night.svg";

const SeoIntro = forwardRef((props, ref) => {
  const localWrapperRef = useRef(null);
  const trackRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 901px)",
        isMobile: "(max-width: 900px)",
      },
      (context) => {
        let { isDesktop, isMobile } = context.conditions;

        // 1. Entrance tilt animation for the card
        gsap.fromTo(
          cardRef.current,
          {
            scale: 0.85,
            rotationZ: isDesktop ? -5 : 0, // Tilted only on desktop
            y: "25vh",
          },
          {
            scale: 1,
            rotationZ: 0,
            y: 0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: localWrapperRef.current,
              start: "top 95%",
              end: "top top",
              scrub: 1,
            },
          },
        );

        // 2. Track animation
        if (isDesktop) {
          // Slide down vertically with a slight angle for the track
          gsap.set(trackRef.current, {
            rotation: -4,
            yPercent: 0,
            xPercent: 0,
          });
          gsap.to(trackRef.current, {
            yPercent: 50,
            xPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: localWrapperRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        } else {
          // Mobile: Horizontal scrolling from left to right
          gsap.set(trackRef.current, { rotation: 0, yPercent: 0, xPercent: 0 });
          gsap.to(trackRef.current, {
            xPercent: -50,
            yPercent: 0,
            ease: "none",
            scrollTrigger: {
              trigger: localWrapperRef.current,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        }
      },
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
                <h2 className="breeze-text">
                  Cape Coral Reviewed: Local Reviews, Businesses & Community
                  Guides
                </h2>
              </div>
              <p className="breeze-text">
                Looking for the best and most popular Cape Coral businesses,
                restaurants, services, and local spots? Cape Coral Reviewed
                helps residents, visitors, and business owners like you connect
                through real reviews, local recommendations, honest business
                spotlights, and true community-driven guides.
              </p>
              <p className="breeze-text">
                From restaurants and coffee shops to home services, wellness
                providers, events, contractors, and small businesses, we make it
                easier to discover—and trust—what’s worth your time here in Cape
                Coral, Florida.
              </p>
            </div>

            {/* RIGHT COLUMN: Responsive Marquee Container Window */}
            <div className={styles.rightGraphicsColumn}>
              <div ref={trackRef} className={styles.graphicsTrack}>
                {[
                  { img: ItalianRestaurant },
                  { img: MugsCheering },
                  { img: lawnMowing },
                  { img: BarNight },
                  { img: BoatRiding },
                  { img: ItalianRestaurant },
                  { img: MugsCheering },
                  { img: BarNight },
                  { img: BoatRiding },
                  { img: lawnMowing },
                  { img: ItalianRestaurant },
                ].map((card, i) => (
                  <div key={i} className={styles.mockListingCard}>
                    <div className={styles.cardImageStub}>
                      {card.img && (
                        <Image
                          src={card.img}
                          alt="Featured spot thumbnail"
                          fill
                          sizes="320px"
                          className={styles.cardImage}
                          priority={i < 4}
                        />
                      )}
                    </div>
                    <div className={styles.cardContentContainer}>
                      <div className={styles.cardTitleLineStub}></div>
                      <div className={styles.starsRowStub}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={styles.miniStar}>
                            ★
                          </span>
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
