"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { formatImageUrl } from "@/lib/formatImageUrl";

export default function HomeSidebar({ featuredBusinesses = [], popularNearYou = [], dict = {}, locale = "en" }) {
  const renderList = (title, items, isFirst = false) => (
    <div style={{ marginBottom: "40px" }}>
      <h3 style={{ 
        fontSize: "1.2rem", 
        fontWeight: "700", 
        marginBottom: "1rem",
        marginTop: 0,
        color: "#333",
        display: "flex",
        alignItems: "center",
        minHeight: isFirst ? "48px" : "auto"
      }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {items.map((item) => {
          const listingUrl = `/listing/${item.slug}`;
          const imageUrl = formatImageUrl(item.featuredImage?.node?.sourceUrl);
          
          const reviewNodes = item.reviews?.nodes || [];
          const reviewCount = reviewNodes.length;
          const averageRating = reviewCount > 0 
            ? (reviewNodes.reduce((acc, curr) => acc + (Number.parseFloat(curr.reviewFields?.starRating) || 0), 0) / reviewCount).toFixed(1)
            : "0.0";

          return (
            <Link 
              key={item.databaseId} 
              href={listingUrl}
              style={{ 
                display: "flex", 
                gap: "12px", 
                textDecoration: "none",
                color: "inherit",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateX(5px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "translateX(0)"}
            >
              <div style={{ 
                position: "relative", 
                width: "80px", 
                height: "80px", 
                flexShrink: 0,
                borderRadius: "8px",
                overflow: "hidden"
              }}>
                <Image
                  src={imageUrl}
                  alt={item.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <h4 style={{ 
                  fontSize: "0.95rem", 
                  fontWeight: "600", 
                  margin: "0 0 4px 0",
                  color: "#333",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden"
                }}>
                  {item.title}
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <Star size={14} fill="#d32323" color="#d32323" />
                  <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{averageRating}</span>
                  <span style={{ fontSize: "0.8rem", color: "#666" }}>({reviewCount})</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#888", marginTop: "2px" }}>
                  {item.directoryTypes?.nodes?.[0]?.name}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside style={{ width: "100%" }}>
      {renderList(dict.featuredBusinesses || "Featured Businesses", featuredBusinesses.slice(0, 5), true)}
      {renderList(dict.popularNearYou || "Popular Near You", popularNearYou.slice(0, 5))}
    </aside>
  );
}
