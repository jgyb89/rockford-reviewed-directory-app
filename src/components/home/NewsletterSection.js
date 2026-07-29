'use client';

import Image from 'next/image';
import NewsletterForm from '@/components/newsletter/NewsletterForm'; // Reusing your existing form!
import styles from './NewsletterSection.module.css';

export default function NewsletterSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* Arc Image */}
        <div className={styles.imageWrapper}>
          <Image
            src="/rockford-arc-footer.png"
            alt="Rockford Michigan Arc"
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            style={{ objectFit: 'contain' }}
          />
        </div>

        {/* Content */}
        <h2 className={styles.title}>Stay Connected to Rockford Reviews, Events & Local Finds</h2>
        <p className={styles.text}>
          Want the latest Rockford reviews, restaurant features, business spotlights, event updates, and community recommendations? Subscribe to Rockford Reviewed and keep up with what is happening around Rockford, Michigan.
        </p>

        {/* Form Integration */}
        <div className={styles.formWrapper}>
          <NewsletterForm />
        </div>

      </div>
    </section>
  );
}
