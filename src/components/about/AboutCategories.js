"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./AboutCategories.module.css";

export default function AboutCategories() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Stagger the category pills like a wave
      gsap.fromTo(
        ".category-pill",
        { opacity: 0, x: -30, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <h2 className="breeze-text">What We Do</h2>
        <p className="breeze-text">
          Cape Coral Reviewed helps locals and visitors explore the city through reviews, guides, business listings, and community content. We cover and organize local businesses across categories like:
        </p>
        
        <div className={styles.pillContainer}>
          <div className="category-pill">Restaurants and dining</div>
          <div className="category-pill">Bars, nightlife, coffee shops, and bakeries</div>
          <div className="category-pill">Home services and contractors</div>
          <div className="category-pill">Health, wellness, beauty, and spas</div>
          <div className="category-pill">Real estate, auto, and transport</div>
          <div className="category-pill">Local events, attractions, and community news</div>
          <div className="category-pill">Featured Cape Coral businesses and service providers</div>
        </div>
        
        <p className="breeze-text">
          We also publish Cape Coral reviews, business spotlights, event coverage, and local guides designed to help people make better decisions and support local businesses.
        </p>
      </div>
    </section>
  );
}
