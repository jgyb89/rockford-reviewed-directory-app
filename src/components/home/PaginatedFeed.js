"use client";
import React, { useState } from "react";
import Link from "next/link";
import styles from "./PaginatedFeed.module.css";

export default function PaginatedFeed({
  title,
  viewAllLink,
  viewAllText,
  children,
}) {
  const [visibleCount, setVisibleCount] = useState(8);

  const childrenArray = React.Children.toArray(children);

  if (!childrenArray || childrenArray.length === 0) return null;

  const visibleItems = childrenArray.slice(0, visibleCount);
  const hasMore = visibleCount < childrenArray.length;

  return (
    <section className={styles.paginatedContainer}>
      {/* Header with Title and View All Link */}
      <div className={styles.paginatedHeader}>
        <h2 className={styles.paginatedTitle}>{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className={styles.paginatedLink}>
            {viewAllText}
          </Link>
        )}
      </div>

      {/* Grid / Peek Carousel */}
      <div className="peek-carousel">{visibleItems}</div>

      {/* Load More Pagination */}
      {hasMore && (
        <div className={styles.paginiatedLoadMore}>
          <button
            onClick={() => setVisibleCount((prev) => prev + 4)}
            className={styles.paginiatedLoadMoreButton}
          >
            Load More
          </button>
        </div>
      )}
    </section>
  );
}
