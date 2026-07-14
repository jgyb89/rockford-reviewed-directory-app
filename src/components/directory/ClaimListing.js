'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { submitClaimForm } from '@/lib/actions';
import styles from './ClaimListing.module.css';

export default function ClaimListing({ listingTitle, listingSlug }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    details: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const payload = {
      ...formData,
      listingTitle,
      listingSlug,
    };

    const result = await submitClaimForm(payload);

    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => setIsOpen(false), 3000);
    } else {
      setError(result.message || 'Failed to submit claim. Please try again.');
    }
    setIsSubmitting(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* The Sidebar Trigger Card */}
      <div className={styles['claim-module']}>
        <div className={styles['claim-module__header']}>
          <div className={styles['claim-module__icon-wrap']}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>edit_square</span>
          </div>
          <h3 className={styles['claim-module__title']}>Claim</h3>
        </div>
        <div className={styles['claim-module__body']}>
          <h4 className={styles['claim-module__subtitle']}>Is this your business?</h4>
          <p className={styles['claim-module__text']}>
            Claim listing is the best way to manage and protect your business. Claim now to have ownership of your business!
          </p>
          <button onClick={() => setIsOpen(true)} className={styles['claim-module__btn']}>
            Claim Now
          </button>
        </div>
      </div>

      {/* The Popup Modal */}
      {isOpen && mounted && createPortal(
        <div className={styles['claim-modal']}>
          <div className={styles['claim-modal__dialog']}>
            <div className={styles['claim-modal__header']}>
              <h3 className={styles['claim-modal__title']}>Claim This Listing</h3>
              <button onClick={() => setIsOpen(false)} className={styles['claim-modal__close']}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>close</span>
              </button>
            </div>
            
            <div className={styles['claim-modal__body']}>
              {isSuccess ? (
                <div className={styles['claim-modal__success']}>
                  <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem' }}>check_circle</span>
                  <p>Your claim request has been sent securely! Our team will review it shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles['claim-modal__group']}>
                    <label className={styles['claim-modal__label']}>Full Name <span>*</span></label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className={styles['claim-modal__input']} placeholder="Full Name" />
                  </div>
                  
                  <div className={styles['claim-modal__group']}>
                    <label className={styles['claim-modal__label']}>Email <span>*</span></label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className={styles['claim-modal__input']} placeholder="email@example.com" />
                  </div>
                  
                  <div className={styles['claim-modal__group']}>
                    <label className={styles['claim-modal__label']}>Phone <span>*</span></label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={styles['claim-modal__input']} placeholder="111-111-235" />
                  </div>
                  
                  <div className={styles['claim-modal__group']}>
                    <label className={styles['claim-modal__label']}>Verification Details <span>*</span></label>
                    <textarea required name="details" value={formData.details} onChange={handleChange} className={styles['claim-modal__textarea']} placeholder="Details description about your business..." />
                  </div>

                  {error && <p style={{ color: '#e57007', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

                  <button type="submit" disabled={isSubmitting} className={styles['claim-modal__submit']}>
                    {isSubmitting ? 'Sending...' : 'Submit'}
                  </button>

                  <div className={styles['claim-modal__footer']}>
                    <span className="material-symbols-outlined" style={{ color: '#16a34a', fontSize: '1.1rem' }}>lock</span>
                    Secure Claim Process
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
