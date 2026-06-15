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
import styles from "./HeroSlideshow.module.css";

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
      <div className={styles.emptyState}>
        <p>No featured listings available</p>
      </div>
    );
  }

  return (
    <section className={styles.heroSection}>
      <div ref={emblaRef} className={styles.carouselViewport}>
        <div className={styles.carouselContainer}>
          {featuredListings.map((listing, index) => {
            const imageUrl = formatImageUrl(listing.featuredImage?.node?.sourceUrl);
            const category =
              listing.directoryTypes?.nodes?.[0]?.name || "Local Business";
            const slug = listing.slug;
            const listingUrl = `/listing/${slug}`;

            return (
              <div key={listing.databaseId || index} className={styles.carouselSlide}>
                <Image
                  src={imageUrl}
                  alt={listing.title}
                  fill
                  priority={index === 0}
                  style={{ objectFit: "cover" }}
                />
                <div className={styles.gradientOverlay} />
                <div className={styles.slideContent}>
                  <span className={styles.slideCategory}>
                    {category}
                  </span>
                  <Link href={listingUrl} className={styles.slideLink}>
                    <h2 className={styles.slideTitle}>
                      {listing.title}
                    </h2>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={toggleAutoplay}
        className={`${styles.controlButton} ${styles.playPauseButton}`}
        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      <button
        onClick={scrollPrev}
        className={`${styles.controlButton} ${styles.navButtonLeft}`}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={scrollNext}
        className={`${styles.controlButton} ${styles.navButtonRight}`}
        aria-label="Next slide"
      >
        <ChevronRight size={24} />
      </button>

      <div className={styles.searchCard}>
        <h3 className={styles.searchCardTitle}>
          Discover the Best of Cape Coral: Your Ultimate Local Guide
        </h3>

        <form onSubmit={handleSearch} className={styles.searchForm}>
          <span className={`material-symbols-outlined ${styles.searchIcon}`}>
            search
          </span>
          <input
            type="text"
            placeholder="Search businesses or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </form>

        <div className={styles.pillsSection}>
          <div ref={pillsContainerRef} onScroll={handlePillsScroll} className={styles.pillsTrack}>
            {PILLS.map((pill) => {
              const isActive = pill.slug === 'all';
              return (
                <button
                  key={pill.slug}
                  onClick={() => handlePillClick(pill.slug)}
                  type="button"
                  className={`${styles.pillButton} ${isActive ? styles.pillButtonActive : styles.pillButtonInactive}`}
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {showLeftScroll && (
            <button
              onClick={scrollPillsLeft}
              type="button"
              className={`${styles.pillScrollButton} ${styles.pillScrollLeft}`}
              aria-label="Scroll categories left"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {showRightScroll && (
            <button
              onClick={scrollPillsRight}
              type="button"
              className={`${styles.pillScrollButton} ${styles.pillScrollRight}`}
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
