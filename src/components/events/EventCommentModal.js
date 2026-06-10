// src/components/events/EventCommentModal.js
"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { submitEventComment } from "@/lib/actions";
import styles from "@/components/directory/ReviewModal.module.css";

export default function EventCommentModal({ eventId, eventSlug, isOpen, onClose, currentUser }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setContent("");
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const MAX_CHAR_COUNT = 2000;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (content.trim().length < 5) {
      setError("Your comment must be at least 5 characters long.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const formData = {
      eventId,
      eventSlug,
      content,
    };
    
    const result = await submitEventComment(formData);

    if (result.success) {
      onClose();
    } else {
      setError(result.message || result.error);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className={styles['review-modal-overlay']}>
      <button 
        className={styles['review-modal-overlay__btn']}
        onClick={onClose}
        aria-label="Close modal"
        type="button"
      />
      <dialog 
        className={styles['review-modal']} 
        open
        aria-modal="true"
        aria-labelledby="comment-modal-title"
      >
        <button className={styles['review-modal__close']} onClick={onClose} aria-label="Close modal" type="button">
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 id="comment-modal-title" className={styles['review-modal__title']}>
          Post a Comment
        </h2>

        <form className={styles['review-modal__form']} onSubmit={handleSubmit}>
          <div className={styles['review-modal__form-group']}>
            <label className={styles['review-modal__label']} htmlFor="comment-content">Your Comment</label>
            <textarea
              id="comment-content"
              className={styles['review-modal__textarea']}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={MAX_CHAR_COUNT}
              placeholder="Join the discussion..."
              disabled={isSubmitting}
            />
            <div className={`${styles['review-modal__count']} ${content.length >= MAX_CHAR_COUNT ? styles['review-modal__count--error'] : ""}`}>
              {content.length}/{MAX_CHAR_COUNT}
            </div>
          </div>

          {error && <div className={styles['review-modal__error']}>{error}</div>}

          <button
            type="submit"
            className={styles['review-modal__submit']}
            disabled={isSubmitting || content.trim().length < 5}
          >
            {isSubmitting ? "Submitting..." : "Post Comment"}
          </button>
        </form>
      </dialog>
    </div>
  );
}

EventCommentModal.propTypes = {
  eventId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  eventSlug: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.object,
};
