"use client";

import { forwardRef, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./SeoEnd.module.css";

const SeoEnd = forwardRef((props, ref) => {
  const localWrapperRef = useRef(null);
  const cardRef = useRef(null);
  const bgImageRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    let mm = gsap.matchMedia();

    const ctx = gsap.context(() => {
      // 1. Entrance tilt animation for the card
      gsap.fromTo(
        cardRef.current,
        {
          scale: 0.85,
          rotationZ: -4,
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

      // 2. Background image slide in and fade
      mm.add(
        {
          isDesktop: "(min-width: 901px)",
          isMobile: "(max-width: 900px)",
        },
        (context) => {
          let { isDesktop } = context.conditions;

          gsap.fromTo(
            bgImageRef.current,
            {
              xPercent: -50,
              opacity: 0,
            },
            {
              xPercent: isDesktop ? -20 : 0, // Offset heavily to the left on desktop for padding!
              opacity: 0.75, // Blend with yellow
              duration: 1.5,
              ease: "power3.out",
              scrollTrigger: {
                trigger: localWrapperRef.current,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            },
          );
        },
      );
    }, localWrapperRef);

    return () => ctx.revert();
  }, []);

  const setRefs = (el) => {
    localWrapperRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div ref={setRefs} className={styles.stickyWrapper}>
      <div ref={cardRef} className={styles.flashCard}>
        {/* Background Image sliding in from left */}
        <div ref={bgImageRef} className={styles.bgImageWrapper}>
          <Image
            src="/cape-coral-facebook-reel-grid.jpg"
            alt="Cape Coral Community"
            fill
            className={styles.bgImage}
            priority
          />
        </div>

        <div className={styles.contentMaxWidth}>
          <div className={styles.contentWrapper}>
            {/* TEXT COLUMN (flex-end aligns to right) */}
            <div className={styles.textColumn}>
              <div className={styles.headlineMaskContainer}>
                <h2 className="breeze-text">
                  Real Reviews. Local Spots. Better Recommendations.
                </h2>
              </div>
              <p className="breeze-text">
                We’re not here to create another noisy online group full of
                random posts and arguments. Cape Coral Reviewed is focused on
                useful information, helpful recommendations, and local
                businesses that are worth knowing about. Less noise. Better
                information. Stronger local connections. That’s Cape Coral
                Reviewed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

SeoEnd.displayName = "SeoEnd";
export default SeoEnd;
