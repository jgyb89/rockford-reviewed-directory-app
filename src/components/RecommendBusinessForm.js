'use client';

import { useState } from 'react';
import { submitRecommendationForm } from '@/lib/actions';
import styles from './RecommendBusinessForm.module.css';

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 4) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  }
  return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

export default function RecommendBusinessForm() {
  const [formData, setFormData] = useState({
    submitterName: '',
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    businessPhone: '',
    additionalInfo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'businessPhone') {
      setFormData(prev => ({ ...prev, businessPhone: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      submitData.append(key, val);
    });

    try {
      const result = await submitRecommendationForm(submitData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "An error occurred while submitting your recommendation. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred while submitting your recommendation. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.formWrapper}>
        <div className={styles.successMessage}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>check_circle</span>
          <h3>Thank you for your recommendation!</h3>
          <p>Our team will review this business and reach out to them soon. We appreciate you helping us grow the Cape Coral directory!</p>
          <button onClick={() => {
            setFormData({
              submitterName: '',
              businessName: '',
              businessAddress: '',
              businessEmail: '',
              businessPhone: '',
              additionalInfo: ''
            });
            setSuccess(false);
          }} className={styles.submitBtn} style={{ marginTop: '1.5rem' }}>Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="submitterName">Your Name</label>
          <input type="text" id="submitterName" name="submitterName" required className={styles.input} value={formData.submitterName} onChange={handleChange} placeholder="John Doe" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="businessName">Business Name</label>
          <input type="text" id="businessName" name="businessName" required className={styles.input} value={formData.businessName} onChange={handleChange} placeholder="Cape Coral Bakery" />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="businessAddress">Business Address</label>
          <input type="text" id="businessAddress" name="businessAddress" required className={styles.input} value={formData.businessAddress} onChange={handleChange} placeholder="123 Cape Coral Pkwy" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '240px' }}>
            <label className={styles.label} htmlFor="businessEmail">Business Email</label>
            <input type="email" id="businessEmail" name="businessEmail" className={styles.input} value={formData.businessEmail} onChange={handleChange} placeholder="info@business.com" />
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '240px' }}>
            <label className={styles.label} htmlFor="businessPhone">Business Phone</label>
            <input type="tel" id="businessPhone" name="businessPhone" className={styles.input} value={formData.businessPhone} onChange={handleChange} placeholder="(239) 555-0123" />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="additionalInfo">Why are you recommending them?</label>
          <textarea id="additionalInfo" name="additionalInfo" className={styles.textarea} value={formData.additionalInfo} onChange={handleChange} placeholder="They have the best service in town..." />
        </div>

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? 'Submitting...' : 'Recommend Business'}
        </button>
      </form>
    </div>
  );
}
