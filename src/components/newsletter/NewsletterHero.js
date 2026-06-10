import React from "react";
import NewsletterForm from "./NewsletterForm";
import styles from "../about/AboutHero.module.css";

export default function NewsletterHero() {
  return (
    <section className={styles.heroSection} style={{ padding: "8rem 1.5rem" }}>
      <div className={styles.ocean}>
        <div className={styles.wave}></div>
        <div className={styles.wave}></div>
      </div>
      
      <div 
        className={styles.container} 
        style={{ 
          backgroundColor: "#ffffff", 
          padding: "3rem 2rem", 
          borderRadius: "16px", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          textAlign: "center",
          color: "#111",
          width: "100%",
          maxWidth: "800px",
          margin: "0 auto"
        }}
      >
        <h1 
          style={{ 
            fontSize: "clamp(2.5rem, 5vw, 3.5rem)", 
            fontWeight: "800", 
            marginBottom: "1.5rem", 
            lineHeight: "1.1", 
            fontFamily: "var(--font-heading)" 
          }}
        >
          The Best of Cape Coral, Delivered Weekly.
        </h1>
        <p 
          style={{ 
            fontSize: "1.125rem", 
            color: "#4a4a4a", 
            marginBottom: "2.5rem", 
            lineHeight: "1.6",
            maxWidth: "600px",
            margin: "0 auto 2.5rem"
          }}
        >
          Join thousands of locals who rely on Cape Coral Reviewed for the latest weekend events, top-rated restaurant reviews, and local business highlights in SWFL. 100% free. No spam.
        </p>
        
        <NewsletterForm />
      </div>
    </section>
  );
}
