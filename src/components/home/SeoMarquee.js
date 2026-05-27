"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./SeoMarquee.module.css";

export default function SeoMarquee() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        xPercent: -50,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles.marqueeContainer}>
      <h3 className={`breeze-text ${styles.marqueeTitle}`}>
        Explore Local Reviews & Business Spotlights
      </h3>
      <div ref={trackRef} className={styles.marqueeTrack}>
        {/* Duplicated for a seamless infinite scroll effect */}
        {["Restaurants & Dining", "Home Services & Contractors", "Health, Beauty & Wellness", "Local Events", "Coffee & Nightlife", "Restaurants & Dining", "Home Services & Contractors", "Health, Beauty & Wellness"].map((cat, i) => (
          <span key={i} className={styles.pill}>{cat}</span>
        ))}
      </div>
      <p className={`breeze-text ${styles.marqueeDesc}`}>
        Every review and spotlight is created to help people make better local choices and support the businesses that keep Cape Coral moving and growing.
      </p>
    </div>
  );
}
