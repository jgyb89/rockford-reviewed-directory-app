'use client';

import { useState } from 'react';
import Image from 'next/image';
import parse from 'html-react-parser';
import { submitBlogComment } from '@/lib/actions';
import LoginModal from '@/components/auth/LoginModal';
import styles from './BlogComments.module.css';

export default function BlogComments({ postId, initialComments = [], currentUser }) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError('');

    const result = await submitBlogComment(postId, newComment);

    if (result.success) {
      // Optimistically add the new comment to the list
      setComments([...comments, result.comment]);
      setNewComment('');
    } else {
      setError(result.error || 'Failed to submit comment. Please try again.');
    }
    setIsSubmitting(false);
  };

  return (
    <section className={styles.commentsContainer}>
      <div className={styles.headerWrapper}>
        <h3 className={styles.title}>Comments ({comments.length})</h3>

        {!currentUser ? (
          <button onClick={() => setIsLoginModalOpen(true)} className={styles.headerActionBtn}>
            Log In or Sign Up
          </button>
        ) : (
          <button onClick={() => setIsFormVisible(!isFormVisible)} className={styles.headerActionBtn}>
            {isFormVisible ? 'Cancel' : 'Write a Comment'}
          </button>
        )}
      </div>

      {currentUser && isFormVisible && (
        <form onSubmit={handleSubmit} className={styles.commentForm} style={{ marginBottom: '2.5rem' }}>
          <h4 style={{ marginBottom: '1rem', fontWeight: '600' }}>Leave a comment</h4>
          <textarea 
            className={styles.textarea} 
            placeholder="Share your thoughts..." 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
            required
          />
          {error && <p style={{ color: '#e04c4c', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {comments.length > 0 ? (
        <div className={styles.commentList}>
          {comments.map((comment) => (
            <div key={comment.id} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <Image 
                  src={comment.author?.node?.avatar?.url || '/default-avatar.png'} 
                  alt={comment.author?.node?.name || 'User'} 
                  width={40} 
                  height={40} 
                  className={styles.avatar} 
                />
                <div>
                  <p className={styles.authorName}>{comment.author?.node?.name || 'Anonymous'}</p>
                  <p className={styles.commentDate}>
                    {new Date(comment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className={styles.commentContent}>
                {parse(comment.content)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Be the first to share your thoughts!</p>
      )}

      {/* Trigger the existing modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </section>
  );
}
