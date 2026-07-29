'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SeoCommunity.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function SeoCommunity() {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Group elements to create a sequenced cascading reveal
      const elementsToAnimate = gsap.utils.toArray([
        `.${styles.header}`,
        `.${styles.imageWrapper}`,
        `.${styles.text}`,
        `.${styles.ctaButton}`
      ]);

      gsap.from(elementsToAnimate, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
        }
      });
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.card} ref={cardRef}>
        
        <div className={styles.header}>
          <h2 className={styles.title}>Supporting Rockford, Michigan Local Businesses</h2>
          <p className={styles.subtitle}>A strong local business community makes Rockford stronger.</p>
        </div>

        <div className={styles.contentRow}>
          
          <div className={styles.imageColumn}>
            <div className={styles.imageWrapper}>
              <Image
                src="/rockford-fall-dam.jpg"
                alt="Rockford Fall Dam"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <div className={styles.imageWrapper}>
              <Image
                src="/rockford-lbd-exchange.jpg"
                alt="Rockford Local Business"
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>

          <div className={styles.textColumn}>
            <p className={styles.text}>
              When residents choose local restaurants, hire local service providers, visit local shops, and recommend businesses they trust, that support stays close to home. 
            </p>
            <p className={styles.text}>
              Rockford Reviewed gives business owners another way to be found and gives the community another reason to shop, dine, hire, and support local.
            </p>
            <p className={styles.text}>
              We believe good Rockford businesses deserve visibility, and local residents deserve a simple way to find them.
            </p>
            
            <Link href="/directory" className={styles.ctaButton}>
              Explore Rockford Businesses
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
