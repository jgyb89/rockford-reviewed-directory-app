'use client';

import { useState } from 'react';
import { submitContactForm } from '@/lib/actions';
import styles from './ContactForm.module.css';

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

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitContactForm(formData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || "An error occurred while sending your message. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred while sending your message. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.formWrapper}>
        <div className={styles.successMessage}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>check_circle</span>
          <h3>Message Sent!</h3>
          <p>Thank you for reaching out to Cape Coral Reviewed. Our team will get back to you shortly.</p>
          <button onClick={() => {
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              message: ''
            });
            setSuccess(false);
          }} className={styles.submitBtn} style={{ marginTop: '1.5rem' }}>Send Another Message</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.formWrapper}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="firstName">First Name *</label>
            <input type="text" id="firstName" name="firstName" required className={styles.input} value={formData.firstName} onChange={handleChange} placeholder="John" />
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="lastName">Last Name *</label>
            <input type="text" id="lastName" name="lastName" required className={styles.input} value={formData.lastName} onChange={handleChange} placeholder="Doe" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="email">Email *</label>
            <input type="email" id="email" name="email" required className={styles.input} value={formData.email} onChange={handleChange} placeholder="john@example.com" />
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" className={styles.input} value={formData.phone} onChange={handleChange} placeholder="(239) 555-0123" />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="message">Your Message *</label>
          <textarea id="message" name="message" required className={styles.textarea} value={formData.message} onChange={handleChange} placeholder="How can we help you?" />
        </div>

        <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
