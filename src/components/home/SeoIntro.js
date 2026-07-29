'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SeoIntro.module.css';

// Register ScrollTrigger to ensure it fires safely on the client
gsap.registerPlugin(ScrollTrigger);

export default function SeoIntro() {
  const sectionRef = useRef(null);

  useEffect(() => {
    // Isolated GSAP Context for Next.js safe cleanup
    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current.children, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2, // Cascades the image, then the text
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 85%', // Animation starts when the top of the section hits 85% of the viewport
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section} ref={sectionRef}>
      <div className={styles.imageWrapper}>
        <Image
          src="/rockford-michigan-dam-overlook.png"
          alt="Rockford Michigan Dam Overlook"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: 'cover' }}
        />
      </div>

      <div className={styles.content}>
        <p className={styles.text}>
          Looking for trusted Rockford reviews, local restaurants, home services, shops, events, and small businesses? 
        </p>
        <p className={styles.text}>
          Here at Rockford Reviewed, we help residents, visitors, and business owners connect with the places and people that make Rockford, Michigan worth exploring.
        </p>
        <p className={styles.text}>
          From downtown dining and coffee shops– to contractors, wellness providers, boutiques, family-friendly events, and local service companies– we make it easier to find businesses worth supporting right here in Rockford.
        </p>
        
        <Link href="/directory" className={styles.ctaButton}>
          Explore Rockford Businesses
        </Link>
      </div>
    </section>
  );
}
