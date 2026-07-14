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
            },
          },
        );
      });

      // SVG lines animation
      const paths = gsap.utils.toArray(".animated-line");
      paths.forEach((path, i) => {
        // Force the layout length for our 100-unit path
        const length = path.getTotalLength() || 100;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "power2.inOut",
          duration: 2.5,
          delay: i * 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* SVG Animated Lines */}
      <svg
        className={styles.svgLines}
        viewBox="0 0 140 10000"
        preserveAspectRatio="xMinYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Brand Red */}
        <path
          className="animated-line"
          d="M 105 0 L 105 10000"
          stroke="#e57007"
          strokeWidth="32"
          fill="none"
          strokeLinecap="round"
        />
        {/* Orange */}
        <path
          className="animated-line"
          d="M 75 0 L 75 10000"
          stroke="#ff8c00"
          strokeWidth="32"
          fill="none"
          strokeLinecap="round"
        />
        {/* Brand Yellow */}
        <path
          className="animated-line"
          d="M 45 0 L 45 10000"
          stroke="#ffd700"
          strokeWidth="32"
          fill="none"
          strokeLinecap="round"
        />
        {/* White */}
        <path
          className="animated-line"
          d="M 15 0 L 15 10000"
          stroke="#ffffff"
          strokeWidth="32"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <div className={styles.container}>
        <div className={styles.textBlock}>
          <p className="breeze-text">
            We’re residents ourselves, and we built this site for residents,
            visitors, and business owners who want a better way to connect with
            our amazing Rockford community.
          </p>
          <p className="breeze-text">
            Whether you’re looking for a trusted local service, a new restaurant
            to try, a weekend event, or a small business worth supporting, Cape
            Coral Reviewed gives you a place to start. Our mission is to make
            Rockford reviews more useful, local business discovery easier, and
            community recommendations more reliable.
          </p>
          <p className="breeze-text">
            We look forward to standing alongside you as we support local right
            here in beautiful Rockford, IL.
          </p>
        </div>
        <div className={styles.spacer}></div>
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Why Rockford Reviewed Exists</h2>
          <p className="breeze-text">
            Residents know that Rockford is growing, and so is the number of
            businesses serving the area. That’s a good thing, but it can also
            make it harder to know who to trust, where to go, and which local
            spots are truly worth recommending.
          </p>
          <p className="breeze-text">
            <strong>
              Rockford Reviewed was created to solve that problem. For locals,
              by locals. Updated often.
            </strong>
          </p>
          <p className="breeze-text">
            We wanted to build a cleaner, more helpful local resource where
            people can find real recommendations without digging through online
            noise. Instead of endless arguments, spam, and random posts, Cape
            Coral Reviewed focuses on:
          </p>
          <ul className={styles.list}>
            <li className="breeze-text">Useful local information</li>
            <li className="breeze-text">Business spotlights</li>
            <li className="breeze-text">Community reviews</li>
            <li className="breeze-text">
              Rockford businesses that deserve attention
            </li>
          </ul>
          <p className="breeze-text" style={{ marginTop: "2rem" }}>
            Our goal is simple: help residents and visitors find legitimate
            local businesses and help good Rockford businesses connect with
            people who actually need them.
          </p>
        </div>
      </div>
    </section>
  );
}
