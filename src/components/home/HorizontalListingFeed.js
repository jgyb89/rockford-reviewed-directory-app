"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CcrCard from "@/components/directory/CcrCard";

export default function HorizontalListingFeed({ listings = [], dict = {}, currentUser, locale = "en" }) {
  // align: "start" ensures the first card is flush left. containScroll: "trimSnaps" prevents empty space at the end.
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", containScroll: "trimSnaps", dragFree: true });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    // Disappearing Logic: True if there is room to scroll, False if at the edge
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(); // Check initial state on mount
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", padding: "0 10px" }}>
        <h2 style={{ fontSize: "2rem", fontWeight: "600", color: "#333", margin: 0 }}>
          {dict.popularNearYou || "Popular Near You"}
        </h2>
      </div>

      <div style={{ position: "relative" }}>
        {/* Left Arrow (Hidden when at the very start) */}
        {prevBtnEnabled && (
          <button
            onClick={scrollPrev}
            style={{
              position: "absolute",
              left: "-20px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 20,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              transition: "transform 0.2s, background-color 0.2s"
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Viewport for Cards */}
        <div ref={emblaRef} style={{ overflow: "hidden", padding: "10px" }}>
          <div style={{ display: "flex", gap: "24px" }}>
            {listings.map((listing) => (
              <div key={listing.databaseId} style={{ flex: "0 0 auto", width: "320px", minWidth: 0 }}>
                <CcrCard
                  listing={listing}
                  currentUser={currentUser}
                  locale={locale}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow (Hidden when at the very end) */}
        {nextBtnEnabled && (
          <button
            onClick={scrollNext}
            style={{
              position: "absolute",
              right: "-20px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(0,0,0,0.5)",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 20,
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
              transition: "transform 0.2s, background-color 0.2s"
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
}
