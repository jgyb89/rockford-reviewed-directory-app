"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ALL_CATEGORIES } from "@/lib/constants";
import styles from "./SearchModal.module.css";

const TOP_CATEGORIES = [
  { name: "Restaurants", slug: "restaurants-en", parentSlug: "food-drink" },
  { name: "Plumbers", slug: "plumbers-en", parentSlug: "home-local-services" },
  { name: "Pizza", slug: "pizza-en", parentSlug: "food-drink" },
  {
    name: "Real Estate",
    slug: "real-estate-en",
    parentSlug: "home-local-services",
  },
  { name: "Coffee & Tea", slug: "coffee-tea-en", parentSlug: "food-drink" },
  {
    name: "Roofing",
    slug: "roofing-contractors-en",
    parentSlug: "home-local-services",
  },
  { name: "Seafood", slug: "seafood-en", parentSlug: "food-drink" },
  {
    name: "Auto Repair",
    slug: "auto-repair-mechanics-en",
    parentSlug: "home-local-services",
  },
];

const getCategoryRoute = (slug) => {
  const category = ALL_CATEGORIES.find((c) => c.slug === slug);
  if (!category) return "/directory";

  // If it has a direct directoryType, use it
  if (category.directoryType) {
    return `/directory/${category.directoryType}/${category.slug}`;
  }

  // If it's a child, find the parent's directoryType
  if (category.parentSlug) {
    const parent = ALL_CATEGORIES.find((p) => p.slug === category.parentSlug);
    if (parent && parent.directoryType) {
      return `/directory/${parent.directoryType}/${category.slug}`;
    }
  }

  return `/directory`; // Fallback
};

/**
 * SearchModal Component
 * A predictive search modal for the Cape Coral Directory.
 */
export default function SearchModal({
  isOpen,
  onClose,
  dict = {},
  locale = "en",
}) {
  // State management as requested
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState({
    listings: [],
    categories: [],
  });

  const t = dict?.search || {};
  const navT = dict?.nav || {};

  // Handle Escape key press to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  // GraphQL Search Function
  const performSearch = useCallback(async (queryText) => {
    if (!queryText.trim()) {
      setSearchResults({ listings: [], categories: [] });
      return;
    }

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
          variables: { searchTerm: queryText },
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
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Hybrid Search Redirect
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    // Force redirect to root directory with search param
    import("next/navigation").then(({ useRouter }) => {
      // Note: Since this is a client component inside a hook-less or potentially complex structure,
      // we'll assume the useRouter is available via the component scope if we refactor slightly,
      // but for now, we'll use window.location if necessary or pass router down.
      // Re-reading: SearchModal is a functional component, we can use useRouter hook.
    });

    // Actually, let's use the router from the component scope.
  };

  // Debounced API Call (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      } else {
        setSearchResults({ listings: [], categories: [] });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, performSearch]);

  if (!isOpen) return null;

  return (
    <div
      className={`${styles["search-modal"]} ${isOpen ? styles["search-modal--open"] : ""}`}
    >
      <div
        className={styles["search-modal__overlay"]}
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onClose();
          }
        }}
        role="button"
        tabIndex="-1"
        aria-label="Close modal"
      ></div>

      <div className={styles["search-modal__container"]}>
        <div className={styles["search-modal__header"]}>
          <h2 className={styles["search-modal__title"]}>
            {t.title || "Search Cape Coral"}
          </h2>
          <button onClick={onClose} className={styles["search-modal__close"]}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className={styles["search-modal__body"]}>
          {/* 1. Search Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!searchTerm.trim()) return;
              window.location.href = `/${locale}/directory?search=${encodeURIComponent(searchTerm.trim())}`;
              onClose();
            }}
            className={styles["search-modal__input-wrapper"]}
          >
            <span
              className={`material-symbols-outlined ${styles["search-modal__search-icon"]}`}
            >
              search
            </span>
            <input
              type="text"
              className={styles["search-modal__input"]}
              placeholder={t.placeholder || "What are you looking for?"}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </form>

          {/* 2. Top Category Pills */}
          <div className={styles["search-modal__pills-wrapper"]}>
            {TOP_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/${locale}/directory/${cat.parentSlug}/${cat.slug}`}
                className={styles["search-modal__pill"]}
                onClick={onClose}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* 3. Results Container or Empty State */}
          <div className={styles["search-modal__results-container"]}>
            {!searchTerm.trim() ? (
              /* EMPTY STATE */
              <div className={styles["search-modal__empty-state"]}>
                <span
                  className={`material-symbols-outlined ${styles["search-modal__empty-icon"]}`}
                >
                  search_insights
                </span>
                <p className={styles["search-modal__empty-text"]}>
                  Start typing to find businesses, services, or categories!
                </p>
              </div>
            ) : (
              /* RESULTS STATE */
              <>
                {isLoading ? (
                  <div className={styles["search-modal__loading"]}>
                    Searching...
                  </div>
                ) : (
                  <div className={styles["search-modal__results"]}>
                    {searchResults.listings.length > 0 ||
                    searchResults.categories.length > 0 ? (
                      <div className={styles["search-modal__results-list"]}>
                        {/* Categories Results */}
                        {searchResults.categories.map((cat) => {
                          const route = getCategoryRoute(cat.slug);
                          const categoryHref = `/${locale}${route}`;

                          return (
                            <div
                              key={`cat-${cat.slug}`}
                              className={styles["search-modal__result-item"]}
                            >
                              <Link
                                href={categoryHref}
                                className={styles["search-modal__result-link"]}
                                onClick={onClose}
                              >
                                <span
                                  className={
                                    styles["search-modal__result-title"]
                                  }
                                >
                                  {cat.name}
                                </span>
                                <span
                                  className={
                                    styles["search-modal__result-type"]
                                  }
                                >
                                  Category
                                </span>
                              </Link>
                            </div>
                          );
                        })}

                        {/* Listings Results */}
                        {searchResults.listings.map((listing) => (
                          <div
                            key={`listing-${listing.slug}`}
                            className={styles["search-modal__result-item"]}
                          >
                            <Link
                              href={`/${locale}/listing/${listing.slug}`}
                              className={styles["search-modal__result-link"]}
                              onClick={onClose}
                            >
                              <span
                                className={styles["search-modal__result-title"]}
                              >
                                {listing.title}
                              </span>
                              <span
                                className={styles["search-modal__result-type"]}
                              >
                                Listing
                              </span>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles["search-modal__no-results"]}>
                        No results found for &quot;{searchTerm}&quot;
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
