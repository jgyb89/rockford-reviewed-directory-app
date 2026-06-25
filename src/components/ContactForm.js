'use client';

import { useState } from 'react';
import { submitContactForm } from '@/lib/actions';
import { formatPhoneNumber, EMAIL_REGEX } from '@/lib/formatUtils';
import styles from './ContactForm.module.css';

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
    const val = value ? (typeof value === 'string' ? value.trim() : value) : "";
    
    const rules = {
      firstName: () => !val ? "First name is required" : (val.length < 2 ? "First name must be at least 2 characters" : ""),
      lastName: () => !val ? "Last name is required" : (val.length < 2 ? "Last name must be at least 2 characters" : ""),
      email: () => !value ? "Email is required" : (!EMAIL_REGEX.test(value) ? "Please enter a valid email address" : ""),
      phone: () => !value ? "" : (value.replace(/\D/g, "").length !== 10 ? "Phone number must be exactly 10 digits" : ""),
      message: () => !val ? "Message is required" : (val.length < 5 ? "Message must be at least 5 characters" : "")
    };

    return rules[name] ? rules[name]() : "";
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
