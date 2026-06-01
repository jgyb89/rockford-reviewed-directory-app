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

  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validateField = (name, value) => {
    let error = "";
    if (name === 'firstName') {
      if (!value.trim()) error = "First name is required";
      else if (value.trim().length < 2) error = "First name must be at least 2 characters";
    } else if (name === 'lastName') {
      if (!value.trim()) error = "Last name is required";
      else if (value.trim().length < 2) error = "Last name must be at least 2 characters";
    } else if (name === 'email') {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!value) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Please enter a valid email address";
    } else if (name === 'phone') {
      if (value) {
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 10) error = "Phone number must be exactly 10 digits";
      }
    } else if (name === 'message') {
      if (!value.trim()) error = "Message is required";
      else if (value.trim().length < 5) error = "Message must be at least 5 characters";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'phone') {
      finalValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Real-time validation
    const error = validateField(name, finalValue);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'message'];
    const hasRequired = requiredFields.every(field => formData[field].trim());
    const hasNoErrors = Object.values(fieldErrors).every(err => !err);
    return hasRequired && hasNoErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final validation check
    const errors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix the validation errors before submitting.");
      return;
    }

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
            setFieldErrors({
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
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              required 
              className={`${styles.input} ${fieldErrors.firstName ? styles.inputInvalid : ''}`} 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="John" 
            />
            {fieldErrors.firstName && <span className={styles.errorText}>{fieldErrors.firstName}</span>}
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="lastName">Last Name *</label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              required 
              className={`${styles.input} ${fieldErrors.lastName ? styles.inputInvalid : ''}`} 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Doe" 
            />
            {fieldErrors.lastName && <span className={styles.errorText}>{fieldErrors.lastName}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="email">Email *</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              className={`${styles.input} ${fieldErrors.email ? styles.inputInvalid : ''}`} 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john@example.com" 
            />
            {fieldErrors.email && <span className={styles.errorText}>{fieldErrors.email}</span>}
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="phone">Phone Number</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              className={`${styles.input} ${fieldErrors.phone ? styles.inputInvalid : ''}`} 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="(239) 555-0123" 
            />
            {fieldErrors.phone && <span className={styles.errorText}>{fieldErrors.phone}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="message">Your Message *</label>
          <textarea 
            id="message" 
            name="message" 
            required 
            className={`${styles.textarea} ${fieldErrors.message ? styles.inputInvalid : ''}`} 
            value={formData.message} 
            onChange={handleChange} 
            placeholder="How can we help you?" 
          />
          {fieldErrors.message && <span className={styles.errorText}>{fieldErrors.message}</span>}
        </div>

        <button type="submit" disabled={isSubmitting || !isFormValid()} className={styles.submitBtn}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}
