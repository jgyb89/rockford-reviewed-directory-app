'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import styles from './HomepageInfo.module.css';

export default function HomepageInfo() {
  const contentRef = useRef(null);

  useEffect(() => {
    // Isolated GSAP Context to prevent memory leaks during Next.js routing
    const ctx = gsap.context(() => {
      gsap.from(contentRef.current.children, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        delay: 0.1 // Slight delay to ensure paint is ready
      });
    }, contentRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.heroSection}>
      <div className={styles.imageWrapper}>
        <Image
          src="/rockford-homepage-info.jpg"
          alt="Rockford Michigan Background"
          fill
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          priority // Forces Next.js to preload this for Core Web Vitals
        />
        <div className={styles.overlay}></div>
      </div>

      <div className={styles.content} ref={contentRef}>
        <h1 className={styles.title}>Rockford Reviewed</h1>
        <p className={styles.subtitle}>Your Local Guide to Rockford Businesses</p>
      </div>
    </section>
  );
}
