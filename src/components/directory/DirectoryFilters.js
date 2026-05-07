'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ALL_CATEGORIES } from '@/lib/constants';
import styles from './DirectoryFilters.module.css';

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

const DirectoryFilters = ({ isModalOpen, setIsModalOpen }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const [openDropdown, setOpenDropdown] = useState(null); // 'sort' or 'rating' or null

  const dropdownRef = useRef(null);
  const ratingDropdownRef = useRef(null);

  // Close dropdowns if clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
      if (ratingDropdownRef.current && !ratingDropdownRef.current.contains(event.target)) {
        if (openDropdown === 'rating') setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdown]);

  const ratingFilter = Number.parseInt(searchParams.get('rating')) || 0;
  const openNowFilter = searchParams.get('open') === 'true';

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== '0') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
    setSearchTerm('');
    if (setIsModalOpen) setIsModalOpen(false);
  };

  const handleCategoryClick = (slug) => {
    const locale = pathname.split('/')[1] || 'en';
    if (!slug || pathname.includes(slug)) {
      router.push(`/${locale}/directory`);
    } else {
      const route = getCategoryRoute(slug);
      router.push(`/${locale}${route}`);
    }
    if (setIsModalOpen) setIsModalOpen(false);
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
      <div className={styles['category-pills-desktop']}>
        {pillsContent}
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

  return (
    <>
      {/* 1. Universal Search Bar (Rendered inline in the top controls) */}
      <div className={styles['filter-group-search']} style={{ width: '100%', position: 'relative' }}>
        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '12px', color: '#94a3b8', zIndex: 10 }}>search</span>
        <input
          type="text"
          placeholder="Search businesses or categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          className={styles['filter-input']}
          style={{ width: '100%', paddingLeft: '2.5rem' }}
        />
        {renderPredictiveDropdown()}
      </div>

      {/* 2. Universal Left Slide-Out Modal */}
      {isModalOpen && (
        <div className={styles['modal-overlay']} onClick={() => setIsModalOpen(false)}>
          <div className={styles['modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['modal-header']}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Filters</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Minimum Rating (Label Top) */}
            <div className={styles['filter-group']} style={{ flexDirection: 'column', alignItems: 'flex-start', width: '100%' }}>
              <label className={styles['filter-label']}>Minimum Rating</label>
              <div className={styles['custom-select']} ref={ratingDropdownRef} style={{ width: '100%' }}>
                <button 
                  type="button" 
                  className={styles['custom-select__button']}
                  onClick={() => setOpenDropdown(openDropdown === 'rating' ? null : 'rating')}
                  aria-expanded={openDropdown === 'rating'}
                >
                  {ratingFilter === 0 ? 'Any Rating' : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {ratingFilter}+ <span className={`material-symbols-outlined ${styles['star-icon']}`}>star</span>
                    </span>
                  )}
                  <span className="material-symbols-outlined">expand_more</span>
                </button>
                {openDropdown === 'rating' && (
                  <ul className={styles['custom-select__menu']}>
                    {[0, 1, 2, 3, 4, 5].map((rating) => (
                      <li 
                        key={rating}
                        className={`${styles['custom-select__option']} ${ratingFilter === rating ? styles['custom-select__option--selected'] : ''}`}
                        onClick={() => {
                          updateFilter('rating', rating.toString());
                          setOpenDropdown(null);
                        }}
                      >
                        {rating === 0 ? 'Any Rating' : `${rating}+ Stars`}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Open Now */}
            <div className={styles['filter-group']} style={{ justifyContent: 'space-between', width: '100%', flexDirection: 'row', alignItems: 'center' }}>
              <label className={styles['filter-label']}>Open Now</label>
              <label className={styles['toggle-switch']}>
                <input 
                  type="checkbox" 
                  checked={openNowFilter}
                  onChange={(e) => updateFilter('open', e.target.checked ? 'true' : null)}
                />
                <span className={styles['slider']}></span>
              </label>
            </div>

            {/* Categories */}
            <div style={{ width: '100%' }}>
              <label className={styles['filter-label']} style={{ display: 'block', marginBottom: '0.75rem' }}>Quick Categories</label>
              <div className={styles['category-pills-mobile']}>
                {renderPills(true)}
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button onClick={clearFilters} className={styles['btn-clear']} style={{ background: '#f1f5f9', borderRadius: '8px', width: '100%', padding: '0.75rem', fontWeight: 600 }}>
                Clear All Filters
              </button>
              <button onClick={() => setIsModalOpen(false)} style={{ background: '#e04c4c', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', width: '100%' }}>
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectoryFilters;
