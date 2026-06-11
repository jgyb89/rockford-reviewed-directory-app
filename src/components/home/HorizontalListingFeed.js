"use client";

import React from "react";
import CcrCard from "@/components/directory/CcrCard";

export default function HorizontalListingFeed({ listings = [], dict = {}, currentUser, locale = "en" }) {
  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-6" style={{ padding: "0 10px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "600", color: "#333", margin: 0 }}>
          {dict.popularNearYou || "Popular Near You"}
        </h2>
      </div>

      <div className="peek-carousel" style={{ padding: "0 10px" }}>
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
