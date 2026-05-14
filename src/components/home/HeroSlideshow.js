"use client";

import React, { useCallback, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { formatImageUrl } from "@/lib/formatImageUrl";

export default function HeroSlideshow({ featuredListings = [], locale = "en" }) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = emblaApi?.plugins()?.autoplay;
    if (!autoplay) return;

    if (autoplay.isPlaying()) {
      autoplay.stop();
      setIsPlaying(false);
    } else {
      autoplay.play();
      setIsPlaying(true);
    }
  }, [emblaApi]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      const autoplay = emblaApi?.plugins()?.autoplay;
      if (autoplay) {
        autoplay.reset();
      }
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      const autoplay = emblaApi?.plugins()?.autoplay;
      if (autoplay) {
        autoplay.reset();
      }
    }
  }, [emblaApi]);

  if (!featuredListings || featuredListings.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "500px",
          backgroundColor: "#eee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p>No featured listings available</p>
      </div>
    );
  }

  return (
    <section
      style={{
        position: "relative",
        width: "100%",
        height: "500px",
        overflow: "hidden",
      }}
    >
      <div ref={emblaRef} style={{ height: "100%" }}>
        <div style={{ display: "flex", height: "100%" }}>
          {featuredListings.map((listing, index) => {
            const imageUrl = formatImageUrl(listing.featuredImage?.node?.sourceUrl);
            const category =
              listing.directoryTypes?.nodes?.[0]?.name || "Local Business";
            const slug = listing.slug;
            const listingUrl = `/listing/${slug}`;

            return (
              <div
                key={listing.databaseId || index}
                style={{
                  flex: "0 0 100%",
                  minWidth: 0,
                  position: "relative",
                  height: "100%",
                }}
              >
                <Image
                  src={imageUrl}
                  alt={listing.title}
                  fill
                  priority={index === 0}
                  style={{ objectFit: "cover" }}
                />
                {/* Gradient Overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)",
                  }}
                />
                {/* Content */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "60px",
                    left: "10%",
                    color: "white",
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      backgroundColor: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(4px)",
                      borderRadius: "20px",
                      fontSize: "0.9rem",
                      color: "white",
                      marginBottom: "10px",
                    }}
                  >
                    {category}
                  </span>
                  <Link
                    href={listingUrl}
                    style={{ textDecoration: "none", color: "white" }}
                  >
                    <h2
                      style={{
                        fontSize: "3.5rem",
                        fontWeight: "bold",
                        margin: 0,
                        color: "#fff",
                      }}
                    >
                      {listing.title}
                    </h2>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Play/Pause Toggle */}
      <button
        onClick={toggleAutoplay}
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          zIndex: 20,
          background: "rgba(0,0,0,0.3)",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "44px",
          height: "44px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* Navigation Buttons */}
      <button
        onClick={scrollPrev}
        style={{
          position: "absolute",
          left: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.3)",
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
        }}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        style={{
          position: "absolute",
          right: "20px",
          top: "50%",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.3)",
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
        }}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>
    </section>
  );
}
