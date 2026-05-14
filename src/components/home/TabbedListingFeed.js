"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import CcrCard from "@/components/directory/CcrCard";

/**
 * Helper: Calculate average rating for a listing.
 */
const getAverageRating = (listing) => {
  const reviews = listing.reviews?.nodes || [];
  if (reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, curr) => {
    return acc + (Number.parseFloat(curr.reviewFields?.starRating) || 0);
  }, 0);
  
  return sum / reviews.length;
};

/**
 * Helper: Calculate engagement score (hottest).
 * Currently based on total review count.
 */
const getEngagementScore = (listing) => {
  return listing.reviews?.nodes?.length || 0;
};

export default function TabbedListingFeed({
  initialListings = [],
  currentUser,
  dict = {},
  locale = "en",
}) {
  const tabs = [
    { id: "newest", label: dict.newest || "Newest" },
    { id: "top_rated", label: dict.topRated || "Top Rated" },
    { id: "hottest", label: dict.hottest || "Hottest" },
    { id: "a_z", label: dict.aZ || "A-Z" },
  ];

  const [activeTab, setActiveTab] = useState(tabs[0].id);

  /**
   * Sort listings based on the active tab.
   */
  const sortedListings = useMemo(() => {
    const list = [...initialListings];

    switch (activeTab) {
      case "newest":
        return list.sort((a, b) => (Number(b.databaseId) || 0) - (Number(a.databaseId) || 0));
      
      case "top_rated":
        return list.sort((a, b) => {
          const ratingA = getAverageRating(a);
          const ratingB = getAverageRating(b);
          if (ratingB !== ratingA) return ratingB - ratingA;
          
          // Tie-break with engagement
          return getEngagementScore(b) - getEngagementScore(a);
        });
      
      case "hottest":
        return list.sort((a, b) => getEngagementScore(b) - getEngagementScore(a));
      
      case "a_z":
        return list.sort((a, b) => (a.title || "").localeCompare(b.title || "", locale));
        
      default:
        return list;
    }
  }, [initialListings, activeTab, locale]);

  // Display only the first 9 results for the homepage feed
  const displayListings = sortedListings.slice(0, 9);

  return (
    <div style={{ width: "100%" }}>
      {/* Tabs and View All Button Container */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          borderBottom: "2px solid #eee",
          marginBottom: "1rem", 
          gap: "1rem",
          marginTop: 0,
          paddingBottom: 0,
          minHeight: '48px'
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
            paddingTop: 0,
            paddingRight: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            minHeight: '48px'
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                paddingTop: "8px",
                paddingBottom: "8px",
                paddingLeft: 0,
                paddingRight: 0,
                marginTop: 0,
                marginRight: 0,
                marginLeft: 0,
                fontSize: "1.1rem",
                fontWeight: "600",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: activeTab === tab.id ? "#d32323" : "#666",
                borderBottom:
                  activeTab === tab.id
                    ? "3px solid #d32323"
                    : "3px solid transparent",
                transition: "all 0.2s",
                marginBottom: 0, 
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          href={`/directory`}
          style={{
            backgroundColor: "#d32323",
            color: "white",
            paddingTop: "8px",
            paddingBottom: "8px",
            paddingLeft: "16px",
            paddingRight: "16px",
            borderRadius: "4px",
            fontWeight: "bold",
            textDecoration: "none",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0
          }}
        >
          {dict.viewAll || "View All"}
        </Link>
      </div>

      {/* Grid Container */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
          marginTop: 0, 
          paddingTop: 0
        }}
      >
        {displayListings.map((listing) => (
          <CcrCard
            key={listing.databaseId}
            listing={listing}
            currentUser={currentUser}
            locale={locale}
          />
        ))}
        {displayListings.length === 0 && (
          <p
            style={{
              textAlign: "center",
              gridColumn: "1 / -1",
              paddingTop: "40px",
              paddingBottom: "40px",
              paddingLeft: "40px",
              paddingRight: "40px",
              color: "#666",
            }}
          >
            No listings found.
          </p>
        )}
      </div>
    </div>
  );
}
