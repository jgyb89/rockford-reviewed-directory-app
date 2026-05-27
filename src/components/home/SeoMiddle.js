"use client";

import { forwardRef, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./SeoMiddle.module.css";

const SeoMiddle = forwardRef((props, ref) => {
  const localWrapperRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        {
          scale: 0.85,
          rotationZ: 4,   // Tilted to the right
          y: "25vh",      // Pushed down slightly
        },
        {
          scale: 1,
          rotationZ: 0,   // Straightens out
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: localWrapperRef.current,
            start: "top 95%", // UPDATED: Triggers sooner
            end: "top top",      // Finishes exactly as it locks into the sticky position
            scrub: 1,            // 1 second lag for buttery smoothness
          },
        }
      );
    }, localWrapperRef);

    return () => ctx.revert();
  }, []);

  // Syncs the internal wrapper ref with the parent's forwarded ref (if needed)
  const setRefs = (el) => {
    localWrapperRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div ref={setRefs} className={styles.stickyWrapper}>
      <div ref={cardRef} className={styles.flashCard}>
        {/* Background Decorative Icon */}
        <div className={styles.backgroundIcon}>
          <Image
            src="/cape-coral-reviewed-icon-black.svg"
            alt="Decorative Background Logo"
            fill
            className={styles.bgIconImage}
          />
        </div>

        <div className={styles.contentMaxWidth}>
          <div className={styles.textBlock}>
            {/* Mask Container Wrapper */}
            <div className={styles.headlineMaskContainer}>
              <h2 className="breeze-text">Find Cape Coral Businesses Locals Are Talking About</h2>
            </div>
            <p className="breeze-text">
              Cape Coral is full of great places to eat, shop, visit, and support. The problem is knowing where to start. Here at Cape Coral Reviewed, we bring local businesses into one easy-to-use directory so you can search by category, read reviews, browse featured businesses, and find recommendations from people who actually live, work, and spend time right here in the community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

SeoMiddle.displayName = "SeoMiddle";
export default SeoMiddle;
