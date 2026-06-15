import React from "react";
import styles from "./NewsletterFeatures.module.css";

export default function NewsletterFeatures() {
  const features = [
    {
      icon: "calendar_today",
      title: "Cape Coral Events & Things to Do",
      body: "We aggregate the best local vibe in Cape Coral—from the Cape Coral Farmers Market to live music at local waterfront bars, so you never miss a weekend beat."
    },
    {
      icon: "business",
      title: "Honest Local Business Reviews",
      body: "Looking for the best seafood in Cape Coral or a reliable plumber? We feature top-rated pros and authentic reviews for local services."
    },
    {
      icon: "loyalty",
      title: "SWFL Community News & Alerts",
      body: "Stay ahead of city changes, hurricane season tips, and neighborhood growth updates affecting Lee County and Cape Coral residents."
    }
  ];

  return (
    <section className={styles.featuresSection}>
      <div className={styles.featuresGrid}>
        {features.map((feature) => (
          <div key={feature.title} className={styles.featureCard}>
            <div className={styles.iconWrapper}>
              <span className={`material-symbols-outlined ${styles.icon}`}>
                {feature.icon}
              </span>
            </div>
            <h3 className={styles.featureTitle}>
              {feature.title}
            </h3>
            <p className={styles.featureBody}>
              {feature.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
