import React from "react";
import styles from "./NewsletterTestimonial.module.css";

export default function NewsletterTestimonial() {
  return (
    <section className={styles.testimonialSection}>
      <div className={styles.testimonialContainer}>
        <h2 className={styles.mainTitle}>
          What Your Neighbors Are Saying
        </h2>
        <div className={styles.quoteWrapper}>
          <span className={`material-symbols-outlined ${styles.quoteIcon}`}>
            format_quote
          </span>
          <blockquote className={styles.blockquoteContent}>
            <p className={styles.quoteText}>
              "I used to spend hours figuring out what to do on the weekends. Now I just wait for the Friday email from Cape Coral Reviewed!"
            </p>
            <footer>
              <strong className={styles.authorName}>Sarah M.</strong>
              <span className={styles.authorTitle}>Cape Coral Resident</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
