"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import styles from "./NewsletterShowcase.module.css";

export default function NewsletterShowcase() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);

  const images = [
    "/stella-maries-newsletter.png",
    "/stella-maries-italian-deli-newlsetter.png",
    "/bar-night-newsletter.png",
    "/life-insurance-newsletter.png",
    "/trusted-plumber-newsletter.png",
    "/burrowing-owl-festival-newsletter.png"
  ];

  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Background Gradient Animation (From Home Page)
      const c1 = "#e94f37";
      const c2 = "#ff8c00";
      const c3 = "#ffd700";
      const c4 = "#32cd32";
      const c5 = "#00ffff";

      const tlBg = gsap.timeline({ repeat: -1, yoyo: true });
      tlBg.to(sectionRef.current, { background: c2, duration: 4, ease: "power1.inOut" })
          .to(sectionRef.current, { background: c3, duration: 4, ease: "power1.inOut" })
          .to(sectionRef.current, { background: c4, duration: 4, ease: "power1.inOut" })
          .to(sectionRef.current, { background: c5, duration: 4, ease: "power1.inOut" })
          .to(sectionRef.current, { background: c1, duration: 4, ease: "power1.inOut" });

      // 2. Infinite Sliding Gallery Marquee
      gsap.to(trackRef.current, {
        xPercent: -50, // Move exactly half the width since we double the array
        ease: "none",
        duration: 35, // Adjust speed here
        repeat: -1
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.showcaseSection}>
      <div className={styles.showcaseHeader}>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
          The Pulse of Cape Coral, Delivered.
        </h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          See what you've been missing. From hidden deli spots to major local festivals, get the inside scoop before anyone else.
        </p>
      </div>

      <div className={styles.galleryContainer}>
        {/* We map the images array twice to create a seamless infinite loop */}
        <div ref={trackRef} className={styles.track}>
          {[...images, ...images].map((img, i) => (
            <div key={`${img}-${i}`} className={styles.imageCard}>
              <div className={styles.imageWrapper}>
                <Image
                  src={img}
                  alt={`Cape Coral Newsletter Issue ${i}`}
                  fill
                  style={{ objectFit: "cover", objectPosition: "top" }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
