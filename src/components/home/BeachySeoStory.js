"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import SeoIntro from "./SeoIntro";
import SeoMiddle from "./SeoMiddle";
import SeoEnd from "./SeoEnd";
import SeoMarquee from "./SeoMarquee";
import SeoCards from "./SeoCards";
import styles from "./BeachySeoStory.module.css";

export default function BeachySeoStory() {
  const wrapperRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. HEADLINE REVEAL SLIDING MASK
      const breezeHeaders = gsap.utils.toArray("h2.breeze-text");
      breezeHeaders.forEach((header) => {
        gsap.fromTo(
          header,
          { translateY: "110%" }, // Hidden inside the overflow wrapper below the mask boundary
          {
            translateY: "0%",
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: header.parentElement, // Triggered by the line mask wrapper
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });

      // 2. PARAGRAPH FADE & RISE ENTRANCE (No tilt/rotation!)
      const breezeParagraphs = gsap.utils.toArray("p.breeze-text, ul.breeze-text li");
      breezeParagraphs.forEach((p) => {
        gsap.fromTo(
          p,
          { opacity: 0, y: 50 }, // Smooth rise baseline
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: "power2.out",
            scrollTrigger: {
              trigger: p,
              start: "top 95%",
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={wrapperRef} className={styles.wrapper}>
      <div className={styles.stackContainer}>
        <SeoIntro />
        <SeoMiddle />
        <SeoEnd />
        <div className={styles.stackSpacer}></div> 
      </div>
      <SeoMarquee />
      <div className={styles.contentMaxWidth}>
        <SeoCards />
      </div>
    </section>
  );
}
