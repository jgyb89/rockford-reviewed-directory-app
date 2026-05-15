"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import styles from './Preloader.module.css';

export default function Preloader() {
  const [showPreloader, setShowPreloader] = useState(false);
  const containerRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    // Set how often the preloader should show (e.g., 7 days in milliseconds)
    // Formula: Hours * Minutes * Seconds * Milliseconds
    const EXPIRATION_TIME = 168 * 60 * 60 * 1000;

    const lastVisited = localStorage.getItem("ccr_last_visited");
    const now = Date.now();

    // If they've never visited, OR if the expiration time has passed since their last visit
    if (!lastVisited || now - parseInt(lastVisited, 10) > EXPIRATION_TIME) {
      setShowPreloader(true);
      // Save the current timestamp to local storage
      localStorage.setItem("ccr_last_visited", now.toString());
    }
  }, []);

  useGSAP(
    () => {
      if (!showPreloader) return;

      const tl = gsap.timeline({
        onComplete: () => {
          if (containerRef.current) {
            containerRef.current.style.display = "none";
          }
        },
      });

      // 1. Logo smoothly fades and scales in (no bounce)
      tl.fromTo(
        logoRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" },
      )
        // 2. The three phrases fade and slide up one by one
        .fromTo(
          ".preloader-phrase",
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.8, stagger: 0.4, ease: "power2.out" },
          "-=0.5", // Start the text slightly before the logo finishes
        )
        // 3. Hold for a moment to let them read, then slide the curtain up
        .to(containerRef.current, {
          yPercent: -100,
          duration: 1.2,
          ease: "power4.inOut",
          delay: 1.5,
        });
    },
    { scope: containerRef, dependencies: [showPreloader] },
  );

  if (!showPreloader) return null;

  return (
    <div ref={containerRef} className={styles.preloaderOverlay}>
      {/* Unified Composite Background Layer */}
      <div className={styles.preloaderBackground} />

      {/* Foreground Elements (Logo & Text) */}
      <div className={styles.preloaderContent}>
        <div ref={logoRef}>
          <Image
            src="/cape-coral-reviewed-round-logo-white.webp"
            alt="Cape Coral Reviewed"
            width={400}
            height={400}
            priority
            style={{ objectFit: "contain" }} 
          />
        </div>

        {/* The Tagline */}
        <div className={styles.preloaderTagline}>
          <span className="preloader-phrase">Read Reviews.</span>
          <span className="preloader-phrase">Leave Reviews.</span>
          <span className="preloader-phrase">Get Reviews.</span>
        </div>
      </div>
    </div>
  );
}
