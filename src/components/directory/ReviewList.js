"use client";

import { useState, useTransition, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import DOMPurify from 'isomorphic-dompurify';
import ReviewModal from './ReviewModal';
import { getCurrentViewer } from '@/lib/actions';

export default function ReviewList({ reviews, noReviewsYet = "No reviews yet. Be the first to leave one!", currentUser: propCurrentUser }) {
  const [currentUser, setCurrentUser] = useState(propCurrentUser);

  const fetchUser = useCallback(async () => {
    if (typeof window !== "undefined" && document.cookie.includes("hasSession=true")) {
      try {
        const viewer = await getCurrentViewer();
        setCurrentUser(viewer || null);
      } catch (err) {
        console.error("Failed to fetch current user in ReviewList:", err);
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }
  }, []);

  // Safely manage state during router refreshes
  useEffect(() => {
    if (propCurrentUser) {
      setCurrentUser(propCurrentUser);
    } else {
      fetchUser();
    }
  }, [propCurrentUser, fetchUser]);
  const [visibleCount, setVisibleCount] = useState(5);
  const [expandedReviews, setExpandedReviews] = useState({});
  const [editingReview, setEditingReview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState(null);
  
  const router = useRouter();

  const nodes = reviews?.nodes || [];

  if (!nodes || nodes.length === 0) {
    return (
      <div className="review-list review-list--empty">
        <p>{noReviewsYet}</p>
      </div>
    );
  }

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  const toggleExpand = (index) => {
    setExpandedReviews(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const WORD_LIMIT = 250;

  const truncateContent = (content, index) => {
    const words = content.split(' ');
    if (words.length <= WORD_LIMIT || expandedReviews[index]) {
      return content;
    }
    return words.slice(0, WORD_LIMIT).join(' ') + '...';
  };

  return (
    <section className="review-list">
      <div className="review-list__container">
        {nodes.slice(0, visibleCount).map((review, index) => {
          const isOwner = currentUser && currentUser.databaseId === review.author?.node?.databaseId;

          // Intercept and show loading state if this specific review is refreshing
          if (isPending && updatingId === review.id) {
            return (
              <article 
                key={`loading-${review.id || index}`} 
                style={{ 
                  backgroundColor: '#ffffff', 
                  padding: '1.5rem 2rem', 
                  borderRadius: '12px', 
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', 
                  border: '1px solid #f1f5f9', 
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: '150px'
                }}
              >
                <div className="review-spinner"></div>
                <span style={{ marginLeft: '1rem', color: '#64748b', fontWeight: '600' }}>
                  Updating your review...
                </span>
              </article>
            );
          }

          // Sanitize the review content
          const cleanReviewContent = DOMPurify.sanitize(review.content || '', {
            ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em'],
            ALLOWED_ATTR: []
          });

          // Ensure star rating falls within 1-5, reading from ACF reviewFields
          const rating = Number.parseFloat(review.reviewFields?.starRating) || 0;
          
          const isLongReview = (review.content || '').split(' ').length > WORD_LIMIT;

          return (
            <article 
              key={review.id || index} 
              className="review-list__item" 
              style={{ 
                position: 'relative', 
                backgroundColor: '#ffffff', 
                padding: '1.5rem 2rem', 
                borderRadius: '12px', 
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', 
                border: '1px solid #f1f5f9', 
                marginBottom: '1.5rem' 
              }}
            >
              {isOwner && (
                <div className="review-owner-actions">
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingReview(review);
                      setIsEditModalOpen(true);
                    }}
                    className="review-edit-btn"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                    Edit
                  </button>
                </div>
              )}

              <header style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
                {/* Circular Avatar */}
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '1.5rem', fontWeight: 'bold', flexShrink: 0 }}>
                  {review.author?.node?.name ? review.author.node.name.charAt(0).toUpperCase() : <span className="material-symbols-outlined">person</span>}
                </div>
                
                {/* Stacked Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <span style={{ fontWeight: '700', fontSize: '1.1rem', color: '#1e293b' }}>
                    {review.author?.node?.name || "Anonymous"}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px' }} aria-label={`${review.reviewFields?.starRating || 0} stars`}>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <span
                          key={val}
                          className="material-symbols-outlined"
                          style={{ 
                            fontSize: '1.1rem',
                            fontVariationSettings: Number(review.reviewFields?.starRating || 0) >= val ? "'FILL' 1" : "'FILL' 0",
                            color: Number(review.reviewFields?.starRating || 0) >= val ? "#f59e0b" : "#e2e8f0"
                          }}
                        >
                          {Number(review.reviewFields?.starRating || 0) >= val ? "star" : "star_outline"}
                        </span>
                      ))}
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
                      {new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </header>

              <div 
                className="review-list__content" 
                style={{ color: '#475569', lineHeight: '1.6', fontSize: '1rem' }}
                dangerouslySetInnerHTML={{ __html: truncateContent(cleanReviewContent, index) }} 
              />
              
              {/* Restore the Read More button if applicable */}
              {isLongReview && (
                <button 
                  className="review-list__read-more" 
                  onClick={() => toggleExpand(index)}
                  style={{ background: 'none', border: 'none', color: '#e04c4c', cursor: 'pointer', padding: 0, marginTop: '0.5rem', fontWeight: '600' }}
                >
                  {expandedReviews[index] ? 'Read less' : 'Read more'}
                </button>
              )}
            </article>
          );
        })}
      </div>

      {/* Load More Button (if applicable) */}
      {visibleCount < nodes.length && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button 
            onClick={handleShowMore}
            style={{ background: '#f1f5f9', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
          >
            Load More Reviews
          </button>
        </div>
      )}

      {/* The Edit Modal */}
      <ReviewModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setUpdatingId(editingReview?.id);
          startTransition(() => {
            router.refresh();
          });
          setEditingReview(null);
        }} 
        review={editingReview} 
      />
    </section>
  );
}

ReviewList.propTypes = {
  reviews: PropTypes.shape({
    nodes: PropTypes.arrayOf(PropTypes.object),
  }),
  noReviewsYet: PropTypes.string,
  currentUser: PropTypes.object,
};
