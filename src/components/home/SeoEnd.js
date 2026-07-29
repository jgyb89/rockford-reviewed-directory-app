"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./SeoEnd.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function SeoEnd() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Grouping header to animate as a single block, matching SeoMiddle logic
      const elementsToAnimate = gsap.utils.toArray([
        `.${styles.header}`,
        `.${styles.listItem}`,
        `.${styles.ctaButton}`,
        `.${styles.imageWrapper}`,
      ]);

      gsap.from(elementsToAnimate, {
        y: 25,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const listItems = [
    "Restaurants, cafes, bakeries, and coffee shops",
    "Bars, breweries, and nightlife",
    "Home services, contractors, and repair professionals",
    "Health, wellness, fitness, and beauty businesses",
    "Shops, boutiques, and retail businesses",
    "Pet services, auto services, and local professionals",
    "Events, attractions, and community happenings",
    "Featured Rockford businesses and service providers",
  ];

  return (
    <section className={styles.section} ref={sectionRef}>
      {/* FULL WIDTH HEADER */}
      <div className={styles.header}>
        <h2 className={styles.title}>Find What You Need Around Rockford</h2>
        <p className={styles.subtitle}>
          Rockford Reviewed helps you explore local options across categories
        </p>
      </div>

      <div className={styles.contentRow}>
        {/* TEXT COLUMN (Left) */}
        <div className={styles.textColumn}>
          <ul className={styles.list}>
            {listItems.map((item, index) => (
              <li key={index} className={styles.listItem}>
                {item}
                <svg
                  className={styles.checkIcon}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </li>
            ))}
          </ul>

          <Link href="/directory" className={styles.ctaButton}>
            Explore Rockford Businesses
          </Link>
        </div>

        {/* IMAGE COLUMN (Right) */}
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <Image
              src="/rockford-downtown-the-corner.jpg"
              alt="Rockford Downtown The Corner"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className={styles.imageWrapper}>
            <Image
              src="/rockford-michigan-mural.jpg"
              alt="Rockford Michigan Mural"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
