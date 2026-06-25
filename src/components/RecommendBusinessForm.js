'use client';

import { useState } from 'react';
import { submitRecommendationForm } from '@/lib/actions';
import { formatPhoneNumber, EMAIL_REGEX } from '@/lib/formatUtils';
import styles from './RecommendBusinessForm.module.css';

export default function RecommendBusinessForm() {
  const [formData, setFormData] = useState({
    submitterName: '',
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    businessPhone: '',
    additionalInfo: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    submitterName: '',
    businessName: '',
    businessAddress: '',
    businessEmail: '',
    businessPhone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validateField = (name, value) => {
    const val = value ? (typeof value === 'string' ? value.trim() : value) : "";
    
    const rules = {
      submitterName: () => !val ? "Your name is required" : (val.length < 2 ? "Your name must be at least 2 characters" : ""),
      businessName: () => !val ? "Business name is required" : (val.length < 2 ? "Business name must be at least 2 characters" : ""),
      businessAddress: () => !val ? "Business address is required" : (val.length < 5 ? "Business address must be at least 5 characters" : ""),
      businessEmail: () => !value ? "" : (!EMAIL_REGEX.test(value) ? "Please enter a valid email address" : ""),
      businessPhone: () => !value ? "" : (value.replace(/\D/g, "").length !== 10 ? "Phone number must be exactly 10 digits" : "")
    };

    return rules[name] ? rules[name]() : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'businessPhone') {
      finalValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Real-time validation
    const error = validateField(name, finalValue);
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const isFormValid = () => {
    const requiredFields = ['submitterName', 'businessName', 'businessAddress'];
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
            setFieldErrors({
              submitterName: '',
              businessName: '',
              businessAddress: '',
              businessEmail: '',
              businessPhone: ''
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
          <label className={styles.label} htmlFor="submitterName">Your Name *</label>
          <input 
            type="text" 
            id="submitterName" 
            name="submitterName" 
            required 
            className={`${styles.input} ${fieldErrors.submitterName ? styles.inputInvalid : ''}`} 
            value={formData.submitterName} 
            onChange={handleChange} 
            placeholder="John Doe" 
          />
          {fieldErrors.submitterName && <span className={styles.errorText}>{fieldErrors.submitterName}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="businessName">Business Name *</label>
          <input 
            type="text" 
            id="businessName" 
            name="businessName" 
            required 
            className={`${styles.input} ${fieldErrors.businessName ? styles.inputInvalid : ''}`} 
            value={formData.businessName} 
            onChange={handleChange} 
            placeholder="Cape Coral Bakery" 
          />
          {fieldErrors.businessName && <span className={styles.errorText}>{fieldErrors.businessName}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="businessAddress">Business Address *</label>
          <input 
            type="text" 
            id="businessAddress" 
            name="businessAddress" 
            required 
            className={`${styles.input} ${fieldErrors.businessAddress ? styles.inputInvalid : ''}`} 
            value={formData.businessAddress} 
            onChange={handleChange} 
            placeholder="123 Cape Coral Pkwy" 
          />
          {fieldErrors.businessAddress && <span className={styles.errorText}>{fieldErrors.businessAddress}</span>}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '240px' }}>
            <label className={styles.label} htmlFor="businessEmail">Business Email</label>
            <input 
              type="email" 
              id="businessEmail" 
              name="businessEmail" 
              className={`${styles.input} ${fieldErrors.businessEmail ? styles.inputInvalid : ''}`} 
              value={formData.businessEmail} 
              onChange={handleChange} 
              placeholder="info@business.com" 
            />
            {fieldErrors.businessEmail && <span className={styles.errorText}>{fieldErrors.businessEmail}</span>}
          </div>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '240px' }}>
            <label className={styles.label} htmlFor="businessPhone">Business Phone</label>
            <input 
              type="tel" 
              id="businessPhone" 
              name="businessPhone" 
              className={`${styles.input} ${fieldErrors.businessPhone ? styles.inputInvalid : ''}`} 
              value={formData.businessPhone} 
              onChange={handleChange} 
              placeholder="(239) 555-0123" 
            />
            {fieldErrors.businessPhone && <span className={styles.errorText}>{fieldErrors.businessPhone}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="additionalInfo">Why are you recommending them?</label>
          <textarea 
            id="additionalInfo" 
            name="additionalInfo" 
            className={styles.textarea} 
            value={formData.additionalInfo} 
            onChange={handleChange} 
            placeholder="They have the best service in town..." 
          />
        </div>

        <button type="submit" disabled={isSubmitting || !isFormValid()} className={styles.submitBtn}>
          {isSubmitting ? 'Submitting...' : 'Recommend Business'}
        </button>
      </form>
    </div>
  );
}
