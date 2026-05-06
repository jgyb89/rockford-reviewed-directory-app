'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ALL_CATEGORIES } from '@/lib/constants';
import styles from './DirectoryFilters.module.css';
import 'material-symbols/outlined.css';

const QUICK_PILLS = [
  { label: 'Restaurants', slug: 'restaurants-en' },
  { label: 'Bars & Nightlife', slug: 'bars-nightlife-en' },
  { label: 'Cafes & Bakeries', slug: 'cafes-bakeries-en' },
  { label: 'Medical & Dental', slug: 'medical-dental-en' },
  { label: 'Contractors & Repair', slug: 'contractors-repair-en' },
  { label: 'Beauty & Spas', slug: 'beauty-spas-en' },
  { label: 'Real Estate', slug: 'real-estate-en' },
  { label: 'Auto & Transport', slug: 'auto-transport-en' }
];

const getCategoryRoute = (slug) => {
  const category = ALL_CATEGORIES.find(c => c.slug === slug);
  if (!category) return '/directory';

  // If it has a direct directoryType, use it
  if (category.directoryType) {
    return `/directory/${category.directoryType}/${category.slug}`;
  }

  // If it's a child, find the parent's directoryType
  if (category.parentSlug) {
    const parent = ALL_CATEGORIES.find(p => p.slug === category.parentSlug);
    if (parent && parent.directoryType) {
      return `/directory/${parent.directoryType}/${category.slug}`;
    }
  }

  return `/directory`; // Fallback
};

export default function DirectoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  
  // Unified Predictive Search State
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);
  const [searchResults, setSearchResults] = useState({ listings: [], categories: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // 1. Debounce input and filter the current directory grid
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      updateFilter('search', searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Fetch Global Predictive Results (Categories & Listings)
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults({ listings: [], categories: [] });
      return;
    }

    const fetchResults = async () => {
      setIsLoading(true);
      
      const query = `
        query SearchQuery($searchTerm: String!) {
          ccrlistings(where: {search: $searchTerm}) {
            nodes {
              title
              slug
            }
          }
          ccrlistingcategories(where: {search: $searchTerm}) {
            nodes {
              name
              slug
              parent {
                node {
                  slug
                }
              }
            }
          }
        }
      `;

      try {
        const response = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query,
            variables: { searchTerm: debouncedSearch },
          }),
        });

        const json = await response.json();

        if (json.data) {
          setSearchResults({
            listings: json.data.ccrlistings?.nodes || [],
            categories: json.data.ccrlistingcategories?.nodes || [],
          });
        }
      } catch (error) {
        console.error("Predictive search error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch]);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null); // 'sort' or 'rating' or null

  const pillContainerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Close dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentRating = searchParams.get('rating') || '';
  const currentSort = searchParams.get('sort') || 'newest';

  const handleScroll = () => {
    if (pillContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pillContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < (scrollWidth - clientWidth - 1));
    }
  };

  useEffect(() => {
    // Initial check
    handleScroll();
    
    // Check on resize
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const scrollPills = (direction) => {
    if (pillContainerRef.current) {
      const scrollAmount = 300; // The distance to scroll in pixels
      pillContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchTerm('');
    setIsMobileModalOpen(false);
  };

  const handleCategoryClick = (slug) => {
    const locale = pathname.split('/')[1] || 'en';
    if (!slug || pathname.includes(slug)) {
      router.push(`/${locale}/directory`);
    } else {
      const route = getCategoryRoute(slug);
      router.push(`/${locale}${route}`);
    }
    setIsMobileModalOpen(false);
  };

  const renderPills = (isMobile = false) => {
    const pillsContent = (
      <>
        <button 
          className={`${styles['category-pill']} ${pathname.endsWith('/directory') ? styles['category-pill--active'] : ''}`}
          onClick={() => handleCategoryClick('')}
        >
          All
        </button>
        {QUICK_PILLS.map(pill => (
          <button 
            key={pill.slug}
            className={`${styles['category-pill']} ${pathname.includes(pill.slug) ? styles['category-pill--active'] : ''}`}
            onClick={() => handleCategoryClick(pill.slug)}
          >
            {pill.label}
          </button>
        ))}
      </>
    );

    if (isMobile) {
      return (
        <div className={styles['category-pills-mobile']}>
          {pillsContent}
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 'calc(100% - 32px)', margin: '0 auto 1.5rem' }}>
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scrollPills('left')}
            aria-label="Scroll left"
            className={`${styles['scroll-arrow']} ${styles['scroll-arrow-left']}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_left</span>
          </button>
        )}

        <div 
          ref={pillContainerRef}
          onScroll={handleScroll}
          className={styles['category-pills-desktop']}
          style={{ scrollBehavior: 'smooth', marginBottom: 0 }}
        >
          {pillsContent}
        </div>

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scrollPills('right')}
            aria-label="Scroll right"
            className={`${styles['scroll-arrow']} ${styles['scroll-arrow-right']}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>chevron_right</span>
          </button>
        )}
      </div>
    );
  };

  const renderPredictiveDropdown = () => {
    if (!isSearchFocused || debouncedSearch.length < 2) return null;

    const locale = pathname.split('/')[1] || 'en';
    const hasCategories = searchResults.categories && searchResults.categories.length > 0;
    const hasListings = searchResults.listings && searchResults.listings.length > 0;
    const hasResults = hasCategories || hasListings;

    return (
      <div className={styles['predictive-dropdown']}>
        {isLoading ? (
          <div className={styles['predictive-message']}>Searching...</div>
        ) : !hasResults ? (
          <div className={styles['predictive-message']}>No results found</div>
        ) : (
          <ul className={styles['predictive-list']}>
            {hasCategories && searchResults.categories.map(cat => {
              const route = getCategoryRoute(cat.slug);
              const categoryHref = `/${locale}${route}`;
              return (
                <li key={`cat-${cat.slug}`} className={styles['predictive-item']}>
                  <Link href={categoryHref} className={styles['predictive-link']}>
                    <span className={styles['predictive-title']}>{cat.name}</span>
                    <span className={styles['predictive-type']}>Category</span>
                  </Link>
                </li>
              );
            })}
            {hasListings && searchResults.listings.map(listing => (
              <li key={`list-${listing.slug}`} className={styles['predictive-item']}>
                <Link href={`/${locale}/listing/${listing.slug}`} className={styles['predictive-link']}>
                  <span className={styles['predictive-title']}>{listing.title}</span>
                  <span className={styles['predictive-type']}>Listing</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  const renderFilters = (isMobile = false) => {
    const sortOptions = [
      { value: 'newest', label: 'Newest' },
      { value: 'highest_rated', label: 'Highest Rated' },
      { value: 'az', label: 'A - Z' },
    ];

    const ratingOptions = [
      { value: '0', label: 'Any Rating', stars: 0 },
      { value: '5', label: '5 Stars Only', stars: 5 },
      { value: '4', label: '4+ Stars', stars: 4 },
      { value: '3', label: '3+ Stars', stars: 3 },
    ];

    const currentSortLabel = sortOptions.find(opt => opt.value === currentSort)?.label || 'Newest';
    const currentRatingLabel = ratingOptions.find(opt => opt.value === currentRating.toString())?.label || 'Any Rating';

    // MOBILE RENDER
    if (isMobile) {
      return (
        <div className={styles['mobile-filter-list']}>
          <div className={styles['filter-group-search']} style={{ position: 'relative', width: '100%', marginBottom: '1rem' }}>
            <input 
              type="text" 
              placeholder="Search businesses or categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className={styles['filter-input']}
              style={{ width: '100%' }}
            />
            {renderPredictiveDropdown()}
          </div>

          {/* Custom Rating Dropdown (Mobile) */}
          <div className={styles['filter-group']}>
            <label className={styles['filter-label']}>Minimum Rating</label>
            <div className={styles['custom-select']}>
              <button 
                type="button"
                className={styles['custom-select__button']} 
                aria-expanded={openDropdown === 'rating'}
                onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentRatingLabel}
                  {Number(currentRating) > 0 && <span className={`material-symbols-outlined ${styles['star-icon']}`}>star</span>}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#94a3b8' }}>expand_more</span>
              </button>

              {openDropdown === 'rating' && (
                <ul className={styles['custom-select__menu']}>
                  {ratingOptions.map(option => (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`${styles['custom-select__option']} ${currentRating.toString() === option.value ? styles['custom-select__option--selected'] : ''}`}
                        onClick={() => {
                          updateFilter('rating', option.value === '0' ? '' : option.value);
                          setOpenDropdown(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            updateFilter('rating', option.value === '0' ? '' : option.value);
                            setOpenDropdown(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '2px',
                          background: 'none',
                          border: 'none',
                          padding: '0.6rem 1rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 'inherit'
                        }}
                      >
                        <span>{option.label}</span>
                        {option.stars > 0 && (
                          <span style={{ display: 'flex' }}>
                            {[...Array(option.stars)].map((_, i) => (
                              <span key={i} className={`material-symbols-outlined ${styles['star-icon']}`} style={{ fontSize: '0.9rem' }}>star</span>
                            ))}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      );
    }

    // DESKTOP RENDER
    return (
      <div className={styles['desktop-filters']}>
        {/* LEFT SIDE: Search & Open Now (Stretches) */}
        <div className={styles['left-controls']}>
          <div className={styles['filter-group-search']} style={{ position: 'relative' }}>
            <input 
              type="text" 
              placeholder="Search businesses or categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              className={styles['filter-input']}
              style={{ width: '100%' }}
            />
            {renderPredictiveDropdown()}
          </div>
        </div>

        {/* RIGHT SIDE: Sort, Rating, Clear (Compact) */}
        <div className={styles['right-controls']}>
          {/* Custom Sort Dropdown */}
          <div className={styles['filter-group']}>
            <label className={styles['filter-label']}>Sort by:</label>
            <div className={styles['custom-select']}>
              <button 
                type="button"
                className={styles['custom-select__button']} 
                aria-expanded={openDropdown === 'sort'}
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
              >
                {currentSortLabel}
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#94a3b8' }}>expand_more</span>
              </button>

              {openDropdown === 'sort' && (
                <ul className={styles['custom-select__menu']}>
                  {sortOptions.map(option => (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`${styles['custom-select__option']} ${currentSort === option.value ? styles['custom-select__option--selected'] : ''}`}
                        onClick={() => {
                          updateFilter('sort', option.value);
                          setOpenDropdown(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            updateFilter('sort', option.value);
                            setOpenDropdown(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          background: 'none',
                          border: 'none',
                          padding: '0.6rem 1rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 'inherit'
                        }}
                      >
                        {option.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Custom Rating Dropdown */}
          <div className={styles['filter-group']}>
            <label className={styles['filter-label']}>Rating:</label>
            <div className={styles['custom-select']}>
              <button 
                type="button"
                className={styles['custom-select__button']} 
                aria-expanded={openDropdown === 'rating'}
                onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {currentRatingLabel}
                  {Number(currentRating) > 0 && <span className={`material-symbols-outlined ${styles['star-icon']}`}>star</span>}
                </span>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem', color: '#94a3b8' }}>expand_more</span>
              </button>

              {openDropdown === 'rating' && (
                <ul className={styles['custom-select__menu']}>
                  {ratingOptions.map(option => (
                    <li key={option.value}>
                      <button
                        type="button"
                        className={`${styles['custom-select__option']} ${currentRating.toString() === option.value ? styles['custom-select__option--selected'] : ''}`}
                        onClick={() => {
                          updateFilter('rating', option.value === '0' ? '' : option.value);
                          setOpenDropdown(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            updateFilter('rating', option.value === '0' ? '' : option.value);
                            setOpenDropdown(null);
                          }
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          gap: '2px',
                          background: 'none',
                          border: 'none',
                          padding: '0.6rem 1rem',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: 'inherit'
                        }}
                      >
                        <span>{option.label}</span>
                        {option.stars > 0 && (
                          <span style={{ display: 'flex' }}>
                            {[...Array(option.stars)].map((_, i) => (
                              <span key={i} className={`material-symbols-outlined ${styles['star-icon']}`} style={{ fontSize: '0.9rem' }}>star</span>
                            ))}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Clear Button */}
          <button 
            onClick={clearFilters} 
            className={styles['btn-clear']} 
            title="Clear Filters"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#64748b', border: 'none', padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>refresh</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className={styles['filter-bar']}>
        {/* DESKTOP: Render unified filter component */}
        {renderFilters(false)}

        {/* MOBILE LEFT: Filter Button (Hidden on Desktop) */}
        <div className={styles['mobile-controls']}>
          <button className={styles['btn-filter-mobile']} onClick={() => setIsMobileModalOpen(true)}>
            <span className="material-symbols-outlined">tune</span> Filters
          </button>
          <button className={styles['btn-clear']} onClick={clearFilters}>
            Clear
          </button>
        </div>
      </div>

      {/* DESKTOP PILLS (Hidden on Mobile) */}
      {renderPills(false)}

      {/* MOBILE MODAL */}
      {isMobileModalOpen && (
        <div className={styles['modal-overlay']}>
          <div className={styles['modal-content']}>
            <div className={styles['modal-header']}>
              <h3 style={{ margin: 0 }}>Filters</h3>
              <button onClick={() => setIsMobileModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div ref={dropdownRef}>
              {renderFilters(true)}
            </div>

            {/* MOBILE PILLS (Wrapped naturally) */}
            <div style={{ marginTop: '0.5rem' }}>
              <label className={styles['filter-label']} style={{ display: 'block', marginBottom: '0.5rem' }}>Quick Categories</label>
              {renderPills(true)}
            </div>
            
            <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <button 
                onClick={clearFilters} 
                style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Clear All Filters
              </button>
              <button 
                onClick={() => setIsMobileModalOpen(false)} 
                style={{ background: '#e04c4c', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}