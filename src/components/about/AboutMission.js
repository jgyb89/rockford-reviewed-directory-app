"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./AboutMission.module.css";

export default function AboutMission() {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const breezeElements = gsap.utils.toArray(".breeze-text");
      
      breezeElements.forEach((el, index) => {
        const rot = index % 2 === 0 ? 2 : -2; // Gentle alternating breeze
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, rotationZ: rot },
          {
            opacity: 1,
            y: 0,
            rotationZ: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            }
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={styles.container}>
        <div className={styles.textBlock}>
          <p className="breeze-text">
            We’re residents ourselves, and we built this site for residents, visitors, and business owners who want a better way to connect with our amazing Cape Coral community.
          </p>
          <p className="breeze-text">
            Whether you’re looking for a trusted local service, a new restaurant to try, a weekend event, or a small business worth supporting, Cape Coral Reviewed gives you a place to start. Our mission is to make Cape Coral reviews more useful, local business discovery easier, and community recommendations more reliable.
          </p>
          <p className="breeze-text">
            We look forward to standing alongside you as we support local right here in beautiful Cape Coral, FL.
          </p>
        </div>
        <div className={styles.spacer}></div>
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Why Cape Coral Reviewed Exists</h2>
          <p className="breeze-text">
            Residents know that Cape Coral is growing, and so is the number of businesses serving the area. That’s a good thing, but it can also make it harder to know who to trust, where to go, and which local spots are truly worth recommending.
          </p>
          <p className="breeze-text">
            <strong>Cape Coral Reviewed was created to solve that problem. For locals, by locals. Updated often.</strong>
          </p>
          <p className="breeze-text">
            We wanted to build a cleaner, more helpful local resource where people can find real recommendations without digging through online noise. Instead of endless arguments, spam, and random posts, Cape Coral Reviewed focuses on:
          </p>
          <ul className={styles.list}>
            <li className="breeze-text">Useful local information</li>
            <li className="breeze-text">Business spotlights</li>
            <li className="breeze-text">Community reviews</li>
            <li className="breeze-text">Cape Coral businesses that deserve attention</li>
          </ul>
          <p className="breeze-text" style={{ marginTop: "2rem" }}>
            Our goal is simple: help residents and visitors find legitimate local businesses and help good Cape Coral businesses connect with people who actually need them.
          </p>
        </div>
      </div>
    </section>
  );
}
