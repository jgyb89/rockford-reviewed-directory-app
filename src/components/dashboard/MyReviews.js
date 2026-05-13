'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { deleteUserReview } from '@/lib/actions';
import ReviewModal from '../directory/ReviewModal';
import Pagination from '../common/Pagination';
import DashboardSortDropdown from './DashboardSortDropdown';
import styles from './MyReviews.module.css';

export default function MyReviews({ reviews: initialReviews, locale = 'en' }) {
  const [reviews, setReviews] = useState(initialReviews || []);
  const [currentSort, setCurrentSort] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (currentSort === 'az' || currentSort === 'za') {
        const titleA = a.reviewFields?.relatedListing?.nodes?.[0]?.title || '';
        const titleB = b.reviewFields?.relatedListing?.nodes?.[0]?.title || '';
        return currentSort === 'az' ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      }
      if (currentSort === 'oldest') return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date); // Default: newest
    });
  }, [reviews, currentSort]);

  // Reset to page 1 on sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [currentSort]);

  const paginatedReviews = sortedReviews.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const [editingReview, setEditingReview] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Custom Delete Modal State
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (review) => {
    setReviewToDelete(review);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setReviewToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete || isDeleting) return;

    setIsDeleting(true);
    
    // Optimistic UI update
    const previousReviews = [...reviews];
    const reviewId = reviewToDelete.id;
    setReviews(reviews.filter((review) => review.id !== reviewId));

    const result = await deleteUserReview(reviewId);

    if (result.success) {
      setIsDeleteModalOpen(false);
      setReviewToDelete(null);
    } else {
      alert(result.error || 'Failed to delete review.');
      setReviews(previousReviews);
    }
    
    setIsDeleting(false);
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingReview(null);
  };

  if (reviews.length === 0) {
    return (
      <div className={styles['my-reviews']}>
        <div className={styles['my-reviews__empty']}>
          <p className={styles['my-reviews__text']}>You haven&apos;t left any reviews yet.</p>
          <Link href="/directory" className={styles['my-reviews__link']}>
            Explore the Directory
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles['my-reviews']}>
      <DashboardSortDropdown currentSortProp={currentSort} onSortChange={(val) => { setCurrentSort(val); setCurrentPage(1); }} />
      <ul className={styles['my-reviews__list']}>
        {paginatedReviews.map((review) => {
          const listing = review.reviewFields?.relatedListing?.nodes?.[0];
          const listingUrl = listing ? `/${locale}/listing/${listing.slug}` : '#';
          const formattedDate = review.date ? new Date(review.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : '';

          const starRating = Number.parseInt(review.reviewFields?.starRating, 10) || 0;

          return (
            <li key={review.id} className={styles['user-review']}>
              <div className={styles['user-review__content-wrapper']}>
                <div className={styles['user-review__header']}>
                  <div className={styles['user-review__info']}>
                    {listing && (
                      <p className={styles['user-review__listing']}>
                        Review for: <Link href={listingUrl} className={styles['user-review__listing-link']}>{listing.title}</Link>
                      </p>
                    )}
                    {formattedDate && <span className={styles['user-review__date']}>{formattedDate}</span>}
                  </div>
                </div>

                <div 
                  className={styles['user-review__content']} 
                  dangerouslySetInnerHTML={{ __html: review.content }} 
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
                <div className={styles['user-review__stars']} aria-label={`${starRating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <span
                      key={val}
                      className={`material-symbols-outlined ${styles['user-review__star']}`}
                      style={{ 
                        fontVariationSettings: starRating >= val ? "'FILL' 1" : "'FILL' 0",
                        color: starRating >= val ? "var(--color-secondary)" : "#ccc"
                      }}
                    >
                      {starRating >= val ? "star" : "star_outline"}
                    </span>
                  ))}
                </div>

                <div className={styles['user-review__actions']}>
                  <button
                    onClick={() => handleEdit(review)}
                    className={styles['user-review__edit-btn']}
                    disabled={isDeleting}
                    style={{ 
                      background: 'transparent', 
                      border: 'none', 
                      color: '#4a5568', 
                      fontWeight: '600', 
                      cursor: 'pointer', 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '0.4rem', 
                      marginRight: '1rem',
                      fontSize: '0.9rem'
                    }}
                    type="button"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit</span>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteClick(review)}
                    className={styles['btn-delete']}
                    disabled={isDeleting}
                    type="button"
                  >
                    <span className="material-symbols-outlined">delete</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <Pagination 
        totalItems={reviews.length} 
        itemsPerPage={ITEMS_PER_PAGE} 
        currentPageProp={currentPage} 
        onPageChange={setCurrentPage} 
      />

      {/* Edit Review Modal */}
      <ReviewModal
        review={editingReview}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
      />

      {/* Custom Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className={styles['my-reviews__modal-overlay']}>
          <button 
            className={styles['my-reviews__modal-overlay-btn']}
            onClick={handleCancelDelete}
            aria-label="Close modal"
            type="button"
          />
          <dialog 
            className={styles['my-reviews__modal']} 
            open
            aria-modal="true"
            aria-labelledby="delete-review-modal-title"
          >
            <div className={styles['my-reviews__modal-icon']}>
              <span className="material-symbols-outlined">warning</span>
            </div>
            <h3 id="delete-review-modal-title" className={styles['my-reviews__modal-title']}>Delete Review?</h3>
            <p className={styles['my-reviews__modal-text']}>
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className={styles['my-reviews__modal-actions']}>
              <button 
                className={`${styles['my-reviews__modal-btn']} ${styles['my-reviews__modal-btn--cancel']}`} 
                onClick={handleCancelDelete}
                disabled={isDeleting}
                type="button"
              >
                Cancel
              </button>
              <button 
                className={`${styles['my-reviews__modal-btn']} ${styles['my-reviews__modal-btn--delete']}`} 
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                type="button"
              >
                {isDeleting ? 'Deleting...' : 'Delete Review'}
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}

MyReviews.propTypes = {
  reviews: PropTypes.array,
};
