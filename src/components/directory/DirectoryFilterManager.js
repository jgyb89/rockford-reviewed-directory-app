"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import PropTypes from "prop-types";
import CcrCardGrid from "./CcrCardGrid";
import DirectoryFilters from "./DirectoryFilters";
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

  const [isModalOpen, setIsModalOpen] = useState(false);

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
