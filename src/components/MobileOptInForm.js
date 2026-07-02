'use client';

import { useState } from 'react';
import { submitMobileOptInForm } from '@/lib/actions';
import { formatPhoneNumber, EMAIL_REGEX } from '@/lib/formatUtils';
import styles from './MobileOptInForm.module.css';

export default function MobileOptInForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consent1: false,
    consent2: false
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    consent1: '',
    consent2: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validateField = (name, value) => {
    const val = typeof value === 'string' ? value.trim() : value;
    
    const rules = {
      firstName: () => !val ? "First name is required" : (val.length < 2 ? "First name must be at least 2 characters" : ""),
      lastName: () => !val ? "Last name is required" : (val.length < 2 ? "Last name must be at least 2 characters" : ""),
      email: () => !val ? "Email is required" : (!EMAIL_REGEX.test(val) ? "Please enter a valid email address" : ""),
      phone: () => !val ? "Phone number is required" : (val.replace(/\D/g, "").length !== 10 ? "Phone number must be exactly 10 digits" : ""),
      consent1: () => !val ? "You must agree to receive marketing messages" : "",
      consent2: () => !val ? "You must agree to receive account alerts" : ""
    };

    return rules[name] ? rules[name]() : "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if (name === 'phone') {
      finalValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Real-time validation
    const error = validateField(name, finalValue);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    const hasRequired = requiredFields.every(field => formData[field].trim());
    const hasConsent = formData.consent1 && formData.consent2;
    const hasNoErrors = Object.values(fieldErrors).every(err => !err);
    return hasRequired && hasConsent && hasNoErrors;
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
      const submitData = new FormData();
      submitData.append('firstName', formData.firstName);
      submitData.append('lastName', formData.lastName);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      if (formData.consent1) submitData.append('consent1', '1');
      if (formData.consent2) submitData.append('consent2', '1');

      const result = await submitMobileOptInForm(submitData);

      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || result.error || "An error occurred while submitting. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred while submitting. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.formWrapper}>
        <div className={styles.successMessage}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>check_circle</span>
          <h3>Successfully Subscribed!</h3>
          <p>Thank you for opting in! You are now signed up for our mobile alerts.</p>
          <button onClick={() => {
            setFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              consent1: false,
              consent2: false
            });
            setFieldErrors({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              consent1: '',
              consent2: ''
            });
            setSuccess(false);
          }} className={styles.submitBtn} style={{ marginTop: '1.5rem' }}>Sign Up Another Number</button>
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
            <label className={styles.label} htmlFor="firstName">First Name <span className={styles.requiredStar}>*</span></label>
            <input 
              type="text" 
              id="firstName" 
              name="firstName" 
              required 
              className={`${styles.input} ${fieldErrors.firstName ? styles.inputInvalid : ''}`} 
              value={formData.firstName} 
              onChange={handleChange} 
              placeholder="John" 
              disabled={isSubmitting}
            />
            {fieldErrors.firstName && <span className={styles.errorText}>{fieldErrors.firstName}</span>}
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="lastName">Last Name <span className={styles.requiredStar}>*</span></label>
            <input 
              type="text" 
              id="lastName" 
              name="lastName" 
              required 
              className={`${styles.input} ${fieldErrors.lastName ? styles.inputInvalid : ''}`} 
              value={formData.lastName} 
              onChange={handleChange} 
              placeholder="Doe" 
              disabled={isSubmitting}
            />
            {fieldErrors.lastName && <span className={styles.errorText}>{fieldErrors.lastName}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="email">Email <span className={styles.requiredStar}>*</span></label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              required 
              className={`${styles.input} ${fieldErrors.email ? styles.inputInvalid : ''}`} 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john@example.com" 
              disabled={isSubmitting}
            />
            {fieldErrors.email && <span className={styles.errorText}>{fieldErrors.email}</span>}
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="phone">Phone Number <span className={styles.requiredStar}>*</span></label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              required
              className={`${styles.input} ${fieldErrors.phone ? styles.inputInvalid : ''}`} 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="(239) 555-0123" 
              disabled={isSubmitting}
            />
            {fieldErrors.phone && <span className={styles.errorText}>{fieldErrors.phone}</span>}
          </div>
        </div>

        <div className={styles.checkboxWrapper}>
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="consent1" 
              name="consent1" 
              required 
              checked={formData.consent1}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <label htmlFor="consent1" className={styles.checkboxLabel}>
              I consent to receive recurring marketing and informational SMS and MMS messages <span className={styles.requiredStar}>*</span>
            </label>
          </div>
          <p className={styles.checkboxDescription}>
            By submitting this form and signing up for text messages, you consent to receive recurring marketing and informational SMS and MMS messages from Cape Coral Reviewed at the mobile number provided, including messages sent using an automatic telephone dialing system or other automated technology. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out and HELP for assistance. View our <a href="https://www.capecoralreviewed.com/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a> | <a href="https://www.capecoralreviewed.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> | <a href="https://www.capecoralreviewed.com/mobile-terms" target="_blank" rel="noopener noreferrer">Mobile Terms</a>
          </p>
          {fieldErrors.consent1 && <span className={styles.errorText}>{fieldErrors.consent1}</span>}
        </div>

        <div className={styles.checkboxWrapper}>
          <div className={styles.checkboxGroup}>
            <input 
              type="checkbox" 
              id="consent2" 
              name="consent2" 
              required 
              checked={formData.consent2}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            <label htmlFor="consent2" className={styles.checkboxLabel}>
              I consent to receive recurring account alerts SMS and MMS messages <span className={styles.requiredStar}>*</span>
            </label>
          </div>
          <p className={styles.checkboxDescription}>
            By submitting this form and signing up for text messages, you consent to receive recurring account alerts SMS and MMS messages from Cape Coral Reviewed at the mobile number provided, including messages sent using an automatic telephone dialing system or other automated technology. Consent is not a condition of purchase. Message frequency varies. Message and data rates may apply. Reply STOP to opt out and HELP for assistance. View our <a href="https://www.capecoralreviewed.com/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a> | <a href="https://www.capecoralreviewed.com/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> | <a href="https://www.capecoralreviewed.com/mobile-terms" target="_blank" rel="noopener noreferrer">Mobile Terms</a>
          </p>
          {fieldErrors.consent2 && <span className={styles.errorText}>{fieldErrors.consent2}</span>}
        </div>

        <button type="submit" disabled={isSubmitting || !isFormValid()} className={styles.submitBtn}>
          {isSubmitting ? 'Submitting...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
}
