"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { SplitText } from "gsap/dist/SplitText";
import styles from "./HomepageInfo.module.css";

// White Round Logo SVG
import whiteRoundLogo from "../../../public/cape-coral-reviewed-icon.svg";

export default function HomepageInfo() {
  const containerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const ctx = gsap.context(() => {
      // 1. HEADLINE REVEAL & WAVE ANIMATION
      const breezeHeaders = gsap.utils.toArray("h2.breeze-text");
      breezeHeaders.forEach((header) => {
        const split = new SplitText(header, { type: "words,chars" });

        // Keep the original slide-up mask reveal
        gsap.fromTo(
          header,
          { translateY: "110%" },
          {
            translateY: "0%",
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: header.parentElement,
              start: "top 95%",
              once: true,
            },
          },
        );

        // Apply the continuous weight and color wave to the words
        gsap.to(split.words, {
          duration: 1,
          "--weight": "800",
          fontWeight: 800,
          color: "#fff", // Cape Coral Red
          ease: "power3.inOut",
          repeat: 0,
          yoyo: true,
          stagger: {
            each: 0.1,
          },
          scrollTrigger: {
            trigger: header.parentElement,
            start: "top 95%",
            toggleActions: "play pause resume pause", // Stops loop when out of view
          },
        });
      });

      // 2. LOGO, PARAGRAPH & STARS FADE & RISE ENTRANCE
      const breezeParagraphs = gsap.utils.toArray(
        ".breeze-logo, p.breeze-text, .breeze-stars",
      );
      breezeParagraphs.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles.darkArea}>
      <div className={styles.darkContent}>
        <div className={`${styles.starsRow} breeze-stars`}>
          <span className="material-symbols-outlined">star</span>
          <span className="material-symbols-outlined">star</span>
          <span className="material-symbols-outlined">star</span>
          <span className="material-symbols-outlined">star</span>
          <span className="material-symbols-outlined">star</span>
        </div>
        <div className={styles.headlineMaskContainer}>
          <h2 className="breeze-text">
            Cape Coral is more than just a destination
          </h2>
        </div>
        <p className="breeze-text">
          It’s a vibrant, fast-growing city of canals, entrepreneurship, and
          tight-knit neighborhoods.
        </p>
      </div>
    </div>
  );
}
