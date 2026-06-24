'use client';

import { useState } from 'react';
import { submitUserToBusinessForm } from '@/lib/actions';
import { formatPhoneNumber, EMAIL_REGEX } from '@/lib/formatUtils';
import styles from './UserToBusinessForm.module.css';

export default function UserToBusinessForm({ dict, categoriesData = [] }) {
  const t = dict?.userToBusiness || {};
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    businessEmail: '',
    phone: '',
    typeOfBusiness: ''
  });

  const [fieldErrors, setFieldErrors] = useState({
    firstName: '',
    lastName: '',
    businessName: '',
    businessEmail: '',
    phone: '',
    typeOfBusiness: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const validateField = (name, value) => {
    const val = value ? (typeof value === 'string' ? value.trim() : value) : "";
    
    switch (name) {
      case 'firstName':
        if (!val) return "First name is required";
        if (val.length < 2) return "First name must be at least 2 characters";
        return "";
      case 'lastName':
        if (!val) return "Last name is required";
        if (val.length < 2) return "Last name must be at least 2 characters";
        return "";
      case 'businessName':
        if (!val) return "Business name is required";
        if (val.length < 2) return "Business name must be at least 2 characters";
        return "";
      case 'businessEmail':
        if (!value) return "Email is required";
        if (!EMAIL_REGEX.test(value)) return "Please enter a valid email address";
        return "";
      case 'phone': {
        if (!value) return "Phone number is required";
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 10) return "Phone number must be exactly 10 digits";
        return "";
      }
      case 'typeOfBusiness':
        if (!val) return "Type of business is required";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    if (name === 'phone') {
      finalValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
    
    // Real-time validation
    const errorMsg = validateField(name, finalValue);
    setFieldErrors(prev => ({ ...prev, [name]: errorMsg }));
  };

  const isFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'businessName', 'businessEmail', 'phone', 'typeOfBusiness'];
    const hasRequired = requiredFields.every(field => formData[field].trim());
    const hasNoErrors = Object.values(fieldErrors).every(err => !err);
    return hasRequired && hasNoErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final validation check
    const errors = {};
    Object.keys(formData).forEach(key => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) {
        errors[key] = errorMsg;
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
      const result = await submitUserToBusinessForm(submitData);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || "An error occurred while upgrading. Please try again.");
        setIsSubmitting(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred while upgrading. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles.formWrapper}>
        <div className={styles.successMessage}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>check_circle</span>
          <h3>{t.successTitle || "Request Received!"}</h3>
          <p>{t.successMessage || "Thank you for upgrading. Our team will review your request and get back to you soon."}</p>
        </div>
      </div>
    );
  }

  // Extract categories for dropdown, ensuring we use the exact title for Gravity Forms backend validation
  const mainCategories = categoriesData.map(cat => cat.title);

  return (
    <div className={styles.formWrapper}>
      {error && <div className={styles.errorMessage}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="firstName">{t.firstName || "First Name *"}</label>
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
            <label className={styles.label} htmlFor="lastName">{t.lastName || "Last Name *"}</label>
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

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="businessName">{t.businessName || "Business Name *"}</label>
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

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="businessEmail">{t.businessEmail || "Business Email *"}</label>
            <input 
              type="email" 
              id="businessEmail" 
              name="businessEmail" 
              required
              className={`${styles.input} ${fieldErrors.businessEmail ? styles.inputInvalid : ''}`} 
              value={formData.businessEmail} 
              onChange={handleChange} 
              placeholder="info@business.com" 
            />
            {fieldErrors.businessEmail && <span className={styles.errorText}>{fieldErrors.businessEmail}</span>}
          </div>
          
          <div className={styles.formGroup} style={{ flex: '1 1 calc(50% - 0.5rem)', minWidth: '200px' }}>
            <label className={styles.label} htmlFor="phone">{t.phone || "Business Phone *"}</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              required
              className={`${styles.input} ${fieldErrors.phone ? styles.inputInvalid : ''}`} 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="(239) 555-0123" 
            />
            {fieldErrors.phone && <span className={styles.errorText}>{fieldErrors.phone}</span>}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="typeOfBusiness">{t.typeOfBusiness || "What type of business? *"}</label>
          <select 
            id="typeOfBusiness" 
            name="typeOfBusiness" 
            required 
            className={`${styles.input} ${fieldErrors.typeOfBusiness ? styles.inputInvalid : ''}`} 
            value={formData.typeOfBusiness} 
            onChange={handleChange} 
          >
            <option value="" disabled>{t.typePlaceholder || "Select a category..."}</option>
            {mainCategories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          {fieldErrors.typeOfBusiness && <span className={styles.errorText}>{fieldErrors.typeOfBusiness}</span>}
        </div>

        <button type="submit" disabled={isSubmitting || !isFormValid()} className={styles.submitBtn}>
          {isSubmitting ? (t.submitting || 'Upgrading...') : (t.submit || 'Upgrade Account')}
        </button>
      </form>
    </div>
  );
}
