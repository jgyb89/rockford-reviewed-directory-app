"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./AboutAudiences.module.css";

export default function AboutAudiences() {
  const sectionRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        leftColRef.current,
        { x: -100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );
      gsap.fromTo(
        rightColRef.current,
        { x: 100, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
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
        
        {/* Left Column */}
        <div ref={leftColRef} className={styles.card}>
          <h3>For Cape Coral Residents and Visitors</h3>
          <p>When you need a recommendation, Cape Coral Reviewed helps you find it. Maybe you’re searching for a new dinner spot, a reliable contractor, a local gym, a family-friendly event, a trusted lawn care company, or a business your neighbors are talking about.</p>
          <p>Our platform gives you a place to browse, compare, review, and discover Cape Coral, Florida local businesses in one location.</p>
          <p>Your reviews and recommendations also help strengthen the community. Every time someone shares a helpful experience, another resident has an easier time choosing where to go, who to hire, and what to support.</p>
        </div>
        
        {/* Right Column */}
        <div ref={rightColRef} className={styles.card}>
          <h3>For Cape Coral Business Owners</h3>
          <p>Cape Coral Reviewed is also built for local business owners who want more visibility in the community.</p>
          <p>If you run a business in Cape Coral, getting listed gives residents and visitors another way to find you. Your listing can help showcase what you offer, collect customer reviews, and connect your business with people searching for Cape Coral services, restaurants, shops, wellness providers, contractors, and more.</p>
          <p><strong>Good local businesses deserve to be seen. Cape Coral Reviewed helps make that happen.</strong></p>
        </div>
      </div>
    </section>
  );
}
