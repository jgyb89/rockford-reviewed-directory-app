import React from "react";
import NewsletterForm from "./NewsletterForm";
import styles from "./NewsletterHero.module.css";

export default function NewsletterHero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.ocean}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>

      <div className={styles.container}>
        <h1 className={styles.heroTitle}>
          The Best of Rockford, Delivered Weekly.
        </h1>
        <p className={styles.heroSubtitle}>
          Join thousands of locals who rely on Rockford Reviewed for the latest
          weekend events, top-rated restaurant reviews, and local business
          highlights in Rockford. 100% free. No spam.
        </p>

        <NewsletterForm />
      </div>
    </section>
  );
}
