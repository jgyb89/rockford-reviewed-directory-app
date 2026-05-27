"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "./AboutCTA.module.css";

export default function AboutCTA() {
  const sectionRef = useRef(null);
  const { locale } = useParams();

  // Handle default locale fallback
  const currentLocale = locale || "en";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Fade and scale up the CTA box
      gsap.fromTo(
        ".cta-content",
        { opacity: 0, scale: 0.95, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      <div className={`cta-content ${styles.container}`}>
        <h2>Our Approach</h2>
        <p>
          We believe local recommendations should be helpful, honest, and easy
          to find. That means our focus is not just on listing businesses. It is
          on building a community resource people can actually use. Cape Coral
          Reviewed brings together local reviews, business information, guides,
          spotlights, and community input so people can make more confident
          decisions.
        </p>
        <p>
          We’re here to support Cape Coral businesses, highlight the people
          doing good work, and give residents a better way to discover what is
          happening right here at home.
        </p>
        <div className={styles.divider}></div>
        <h2 className={styles.headline}>
          Support Local. Review Local. Discover Cape Coral.
        </h2>
        <p className={styles.subHeadline}>
          Cape Coral Reviewed is more than a directory. It is a growing local
          platform for people who care about this city and want to support the
          businesses that make it unique. Explore the directory, read the latest
          reviews, recommend your favorite business, or submit your own listing.
        </p>
        <div className={styles.buttonGroup}>
          <Link
            href={`/${currentLocale}/directory`}
            className={styles.primaryBtn}
          >
            Explore Cape Coral Businesses
          </Link>
          <Link
            href={`/${currentLocale}/submit-listing`}
            className={styles.secondaryBtn}
          >
            Submit Your Business
          </Link>
          <Link
            href={`/${currentLocale}/register`}
            className={styles.secondaryBtn}
          >
            Join the Community
          </Link>
        </div>
      </div>
    </section>
  );
}
