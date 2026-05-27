"use client";

import React, { useCallback, useState, useRef, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { formatImageUrl } from "@/lib/formatImageUrl";
import { ALL_CATEGORIES, getLocalizedUrl } from "@/lib/constants";

const PILLS = [
  { label: 'All', slug: 'all' },
  { label: 'Restaurants', slug: 'restaurants' },
  { label: 'Bars & Nightlife', slug: 'bars-nightlife' },
  { label: 'Cafes & Bakeries', slug: 'cafes-bakeries' },
  { label: 'Medical & Dental', slug: 'medical-dental' },
  { label: 'Contractors & Repair', slug: 'contractors-repair' },
  { label: 'Beauty & Spas', slug: 'beauty-spas' },
  { label: 'Real Estate', slug: 'real-estate' }
];

const getCategoryRoute = (slug) => {
  if (slug === "all") return "/directory";
  const category = ALL_CATEGORIES.find(c => c.slug === slug);
  if (!category) return '/directory';

  const sanitizedSlug = category.slug.replace(/-en$/, '');

  if (category.directoryType) {
    return `/directory/${category.directoryType}/${sanitizedSlug}`;
  }

  if (category.parentSlug) {
    const parent = ALL_CATEGORIES.find(p => p.slug === category.parentSlug);
    if (parent && parent.directoryType) {
      return `/directory/${parent.directoryType}/${sanitizedSlug}`;
    }
  }

  return `/directory`; // Fallback
};

export default function HeroSlideshow({ featuredListings = [], locale = "en" }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);

  const pillsContainerRef = useRef(null);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  const handlePillsScroll = () => {
    if (pillsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pillsContainerRef.current;
      setShowLeftScroll(scrollLeft > 2);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 2);
    }
  };

  const scrollPillsLeft = () => {
    if (pillsContainerRef.current) {
      pillsContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollPillsRight = () => {
    if (pillsContainerRef.current) {
      pillsContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handlePillsScroll();
    window.addEventListener('resize', handlePillsScroll);
    return () => window.removeEventListener('resize', handlePillsScroll);
  }, []);

  const handlePillClick = useCallback((slug) => {
    const route = getCategoryRoute(slug);
    router.push(getLocalizedUrl(route, locale));
  }, [locale, router]);

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

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/${locale}/directory?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push(`/${locale}/directory`);
    }
  }, [searchTerm, locale, router]);

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
        marginBottom: "140px",
      }}
    >
      <div
        ref={emblaRef}
        style={{
          overflow: "hidden",
          position: "relative",
          height: "70vh",
          minHeight: "500px",
        }}
      >
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
                    bottom: "160px",
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
          bottom: "110px",
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

      {/* Floating Card: Search & Categories */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: '50%',
          transform: 'translate(-50%, 50%)',
          width: '90%',
          maxWidth: '960px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.12)',
          padding: '24px 32px',
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#2d3748',
            margin: 0,
            textAlign: 'center',
          }}
        >
          Discover the Best of Cape Coral: Your Ultimate Local Guide
        </h3>

        {/* Search Input Box */}
        <form
          onSubmit={handleSearch}
          style={{
            width: '100%',
            maxWidth: '800px',
            display: 'flex',
            alignItems: 'center',
            border: '1px solid #e2e8f0',
            borderRadius: '30px',
            padding: '4px 16px',
            backgroundColor: '#ffffff',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = '#e04c4c';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(224, 76, 76, 0.15)';
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: '#a0aec0', fontSize: '22px', marginLeft: '4px', cursor: 'default', userSelect: 'none' }}
          >
            search
          </span>
          <input
            type="text"
            placeholder="Search businesses or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '0.95rem',
              color: '#2d3748',
              padding: '10px 12px',
              backgroundColor: 'transparent',
            }}
          />
        </form>

        {/* Category Pills Slider */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center' }}>
          {/* Scrollable track */}
          <div
            ref={pillsContainerRef}
            onScroll={handlePillsScroll}
            style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              width: '100%',
              padding: '4px 0',
              scrollBehavior: 'smooth',
            }}
          >
            <style dangerouslySetInnerHTML={{__html: `
              div::-webkit-scrollbar {
                display: none !important;
              }
            `}} />
            
            {PILLS.map((pill) => {
              const isActive = pill.slug === 'all';
              return (
                <button
                  key={pill.slug}
                  onClick={() => handlePillClick(pill.slug)}
                  type="button"
                  style={{
                    flexShrink: 0,
                    padding: '8px 18px',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    border: '1px solid',
                    borderColor: isActive ? '#e04c4c' : '#e2e8f0',
                    backgroundColor: isActive ? '#e04c4c' : '#f7fafc',
                    color: isActive ? '#ffffff' : '#4a5568',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#edf2f7';
                      e.currentTarget.style.borderColor = '#cbd5e0';
                      e.currentTarget.style.color = '#2d3748';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#f7fafc';
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.color = '#4a5568';
                    }
                  }}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Left Arrow Scroll Button */}
          {showLeftScroll && (
            <button
              onClick={scrollPillsLeft}
              type="button"
              style={{
                position: 'absolute',
                left: '-12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 10,
                color: '#4a5568',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Right Arrow Scroll Button */}
          {showRightScroll && (
            <button
              onClick={scrollPillsRight}
              type="button"
              style={{
                position: 'absolute',
                right: '-12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                zIndex: 10,
                color: '#4a5568',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
              aria-label="Scroll categories right"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
