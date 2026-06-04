/* src/components/blog/BlogView.js */
"use client";

import { useState, useRef, useEffect } from "react";
import BlogCard from "./BlogCard";
import PropTypes from 'prop-types';
import styles from "./Blog.module.css";

export default function BlogView({ posts, dict = {}, locale = "en" }) {
  const t = dict?.blog?.tabs || {};
  
  const TABS = [
    { id: 'all', label: t.all || 'All Posts' },
    { id: 'local-reviews', label: t.localReviews || 'Local Reviews' },
    { id: 'news-events', label: t.newsEvents || 'News & Events' }
  ];

  const [activeTab, setActiveTab] = useState('all');
  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      // Add a 2px buffer to avoid rounding precision issues
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 2); 
    }
  };

  useEffect(() => {
    handleScroll(); // Check initially
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

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'all') return true;
    return post.categorySlugs?.includes(activeTab);
  });

  return (
    <div className={styles['blog-view']}>
      <div className={styles['blog-tabs-wrapper']}>
        {showLeftArrow && (
          <button className={`${styles['scroll-arrow']} ${styles['scroll-arrow-left']}`} onClick={scrollLeft}>
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
        )}

        <nav 
          className={styles['blog-tabs']} 
          aria-label="Blog categories"
          ref={scrollContainerRef}
          onScroll={handleScroll}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles['blog-tabs__item']} ${activeTab === tab.id ? styles['blog-tabs__item--active'] : ""}`}
              onClick={() => setActiveTab(tab.id)}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </nav>

        {showRightArrow && (
          <button className={`${styles['scroll-arrow']} ${styles['scroll-arrow-right']}`} onClick={scrollRight}>
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        )}
      </div>

      {filteredPosts.length > 0 ? (
        <div className={styles['blog-grid']}>
          {filteredPosts.map((post) => (
            <BlogCard key={post.id || post.slug} post={post} locale={locale} />
          ))}
        </div>
      ) : (
        <p>{t.noPosts || 'No posts found in this category.'}</p>
      )}
    </div>
  );
}

BlogView.propTypes = {
  posts: PropTypes.array.isRequired,
  dict: PropTypes.object,
  locale: PropTypes.string,
};
