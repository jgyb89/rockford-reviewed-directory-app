"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PropTypes from "prop-types";
import Breadcrumbs from "../common/Breadcrumbs";
import CcrCardGrid from "./CcrCardGrid";
import DirectoryFilters, { QUICK_PILLS, getCategoryRoute, getDynamicPills } from "./DirectoryFilters";
import Pagination from "../common/Pagination";
import styles from "./DirectoryFilterManager.module.css";
import { checkIfOpenNow } from '@/lib/timeUtils';

const getListingRating = (listing) => {
  const reviews = listing.reviews?.nodes || [];
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce(
    (acc, curr) => acc + (Number.parseFloat(curr.reviewFields?.starRating) || 0),
    0
  );
  return sum / reviews.length;
};

const DirectoryFilterManager = ({ listings, currentUser, dict = {}, locale = "en" }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = dict?.directory || {};

  const activePills = getDynamicPills(pathname);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    }
  };

  useEffect(() => {
    handleScroll(); // Initial check
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== '0') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Current Filters from URL
  const categoryFilter = searchParams.get('category') || '';
  const textSearchFilter = searchParams.get('search') || '';
  const ratingFilter = Number.parseInt(searchParams.get('rating')) || 0;
  const openNowFilter = searchParams.get('open') === 'true';
  const sortByFilter = searchParams.get('sort') || 'newest';

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const filteredAndSortedListings = useMemo(() => {
    let result = [...listings];
    
    // Filter by In-Page Category or Directory Type
    if (categoryFilter) {
      const filterTarget = categoryFilter.toLowerCase();
      result = result.filter((listing) => {
        const matchesDirType = listing.directoryTypes?.nodes?.some(node => node.slug === filterTarget);
        const matchesCategory = listing.ccrlistingcategories?.nodes?.some(node => node.slug === filterTarget);
        return matchesDirType || matchesCategory;
      });
    }

    // Filter by Free-Text Search
    if (textSearchFilter) {
      const target = textSearchFilter.toLowerCase();
      result = result.filter((listing) => {
        if (listing.title?.toLowerCase().includes(target)) return true;
        if (listing.content?.toLowerCase().includes(target)) return true;
        if (listing.ccrlistingcategories?.nodes?.some(node => node.name.toLowerCase().includes(target))) return true;
        return false;
      });
    }

    // Filter by Rating
    if (ratingFilter > 0) {
      result = result.filter((listing) => getListingRating(listing) >= ratingFilter);
    }

    // Filter by Open Now
    if (openNowFilter) {
      result = result.filter((listing) => checkIfOpenNow(listing.listingdata));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortByFilter) {
        case "az":
          return a.title.localeCompare(b.title);
        case "za":
          return b.title.localeCompare(a.title);
        case "highest_rated":
          return getListingRating(b) - getListingRating(a);
        case "newest":
          return new Date(b.date) - new Date(a.date);
        default:
          return 0;
      }
    });

    return result;
  }, [listings, categoryFilter, textSearchFilter, ratingFilter, openNowFilter, sortByFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, textSearchFilter, ratingFilter, openNowFilter, sortByFilter]);

  return (
    <div className={styles['directory-filter-manager']}>
      <Breadcrumbs locale={locale} />
      {/* New Universal Top Bar */}
      <div className={styles['top-controls']}>
        <button 
          className={styles['toggle-filters-btn']}
          onClick={() => setIsModalOpen(true)}
        >
          <span className="material-symbols-outlined">tune</span>
          Filters
        </button>

        <span className={styles['results-count']}>
          {filteredAndSortedListings.length} {t.listingsFound || "Results"}
        </span>

        <div className={styles['search-wrapper']}>
          {/* The Search Bar physically lives here, but controls the modal via props */}
          <DirectoryFilters isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
        </div>

        <select 
          className={styles['sort-dropdown']}
          value={sortByFilter}
          onChange={(e) => updateFilter('sort', e.target.value)}
        >
          <option value="newest">Newest First</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
          <option value="highest_rated">Highest Rated</option>
        </select>
      </div>

      {/* Desktop Horizontal Pills (Below Filter Bar, NOT Sticky) */}
      <div className={styles['desktop-horizontal-pills-container']}>
        {showLeftArrow && (
          <button className={`${styles['scroll-arrow']} ${styles['scroll-arrow-left']}`} onClick={scrollLeft}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}
        <div 
          className={styles['desktop-horizontal-pills']} 
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          <button 
            className={`${styles['category-pill']} ${pathname.endsWith('/directory') ? styles['category-pill--active'] : ''}`}
            onClick={() => router.push('/directory')}
          >
            All
          </button>
          {activePills.map(pill => (
            <button 
              key={pill.slug}
              className={`${styles['category-pill']} ${pathname.includes(pill.slug) ? styles['category-pill--active'] : ''}`}
              onClick={() => {
                const segments = pathname.split('/').filter(Boolean);
                const isSpanish = segments[0] === 'es';
                const localePrefix = isSpanish ? '/es' : '';

                if (pathname.includes(pill.slug)) {
                  // Deselect: Go back to the parent directory type if available
                  const dirIndex = segments.indexOf('directory');
                  if (dirIndex !== -1 && segments.length > dirIndex + 1) {
                    const dirType = segments[dirIndex + 1];
                    router.push(`${localePrefix}/directory/${dirType}`);
                  } else {
                    router.push(`${localePrefix}/directory`);
                  }
                } else {
                  const route = getCategoryRoute(pill.slug);
                  router.push(`${localePrefix}${route}`);
                }
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
        {showRightArrow && (
          <button className={`${styles['scroll-arrow']} ${styles['scroll-arrow-right']}`} onClick={scrollRight}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>

      {/* Main Feed */}
      {filteredAndSortedListings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", border: "1px dashed #ccc", borderRadius: "12px", marginTop: "2rem" }}>
          <p style={{ fontSize: "1.1rem", color: "#64748b" }}>
            {t.noListingsFound || "No listings found matching your criteria. Try adjusting your filters or selecting a different category."}
          </p>
        </div>
      ) : (
        <>
          <CcrCardGrid 
            listings={filteredAndSortedListings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)} 
            currentUser={currentUser} 
            locale={locale} 
          />
          <Pagination 
            totalItems={filteredAndSortedListings.length} 
            itemsPerPage={ITEMS_PER_PAGE} 
            currentPageProp={currentPage} 
            onPageChange={setCurrentPage} 
          />
        </>
      )}
    </div>
  );
};

DirectoryFilterManager.propTypes = {
  listings: PropTypes.array.isRequired,
  currentUser: PropTypes.object,
  dict: PropTypes.object,
  locale: PropTypes.string,
};

export default DirectoryFilterManager;
