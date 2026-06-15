"use client";

import React from "react";
import CcrCard from "@/components/directory/CcrCard";
import styles from "./HorizontalListingFeed.module.css";

export default function HorizontalListingFeed({ listings = [], dict = {}, currentUser, locale = "en" }) {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {dict.popularNearYou || "Popular Near You"}
        </h2>
      </div>

      <div className={`peek-carousel ${styles.carousel}`}>
        {listings.map((listing) => (
          <CcrCard
            key={listing.databaseId}
            listing={listing}
            currentUser={currentUser}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
