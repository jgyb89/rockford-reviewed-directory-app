"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/dist/SplitText";
import styles from "./AboutHero.module.css";

export default function AboutHero() {
  const containerRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(SplitText);
    const ctx = gsap.context(() => {
      const split = new SplitText(textRef.current, { type: "lines,words" });

      // The "Ocean Swell" Reveal
      gsap.fromTo(
        split.words,
        { y: 50, opacity: 0, rotationX: -20 },
        {
          y: 0,
          opacity: 1,
          rotationX: 0,
          duration: 1,
          stagger: 0.05,
          ease: "power3.out",
          delay: 0.2, // Slight delay on page load
        },
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className={styles.heroSection}>
      {/* Wave Background */}
      <div className={styles.ocean}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>

      <div className={styles.container}>
        <h1 ref={textRef} className={styles.heroTitle}>
          About Cape Coral Reviewed
        </h1>
        <p className={`${styles.heroSubtitle} fade-in-up`}>
          Created to help people discover the best Cape Coral businesses,
          restaurants, services, events, and local experiences.
        </p>
      </div>
    </section>
  );
}
