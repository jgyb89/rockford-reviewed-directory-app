'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './StepForm.module.css';
import wizardStyles from './ListingWizard.module.css';

const Step2Contact = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.address?.trim()) newErrors.address = 'Street Address is required';
    
    const unformattedPhone = formData.phone?.replace(/\D/g, '');
    if (unformattedPhone?.length !== 10) {
      newErrors.phone = 'Valid 10-digit Phone Number is required';
    }
    
    if (formData.email && !/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = 'Must start with http:// or https://';
    }

    if (formData.socialUrls?.[0] && !isValidUrl(formData.socialUrls[0])) {
      newErrors.socialUrls = 'Must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  return (
    <div className={styles['step-form']}>
      <header className={styles['step-form__header']}>
        <span className="material-symbols-outlined">contact_mail</span>
        <h2>Contact Information</h2>
      </header>

      <div className={styles['step-form__group']}>
        <label htmlFor="address" className={styles['step-form__label']}>
          Address Street <span className={styles['step-form__required']}>*</span>
        </label>
        <input
          type="text"
          id="address"
          className={`${styles['step-form__input']} ${errors.address ? styles['step-form__input--error'] : ''}`}
          placeholder="123 Main St"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
        />
        {errors.address && <span className={styles['step-form__error-message']}>{errors.address}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles['step-form__group']}>
          <label htmlFor="city" className={styles['step-form__label']}>City</label>
          <input
            type="text"
            id="city"
            className={styles['step-form__input']}
            placeholder="Cape Coral"
            value={formData.city || ''}
            onChange={(e) => updateFormData({ city: e.target.value })}
          />
        </div>
        <div className={styles['step-form__group']}>
          <label htmlFor="state" className={styles['step-form__label']}>State</label>
          <input
            type="text"
            id="state"
            className={styles['step-form__input']}
            placeholder="FL"
            value={formData.state || ''}
            onChange={(e) => updateFormData({ state: e.target.value })}
          />
        </div>
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="zipCode" className={styles['step-form__label']}>Zip Code</label>
        <input
          type="text"
          id="zipCode"
          className={styles['step-form__input']}
          placeholder="33904"
          value={formData.zipCode || ''}
          onChange={(e) => updateFormData({ zipCode: e.target.value })}
        />
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="phone" className={styles['step-form__label']}>
          Phone Number <span className={styles['step-form__required']}>*</span>
        </label>
        <input
          type="tel"
          id="phone"
          className={`${styles['step-form__input']} ${errors.phone ? styles['step-form__input--error'] : ''}`}
          placeholder="(239) 000-0000"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: formatPhoneNumber(e.target.value) })}
        />
        {errors.phone && <span className={styles['step-form__error-message']}>{errors.phone}</span>}
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="email" className={styles['step-form__label']}>Email Address</label>
        <input
          type="email"
          id="email"
          className={`${styles['step-form__input']} ${errors.email ? styles['step-form__input--error'] : ''}`}
          placeholder="info@business.com"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
        />
        {errors.email && <span className={styles['step-form__error-message']}>{errors.email}</span>}
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="website" className={styles['step-form__label']}>Website URL</label>
        <input
          type="url"
          id="website"
          className={`${styles['step-form__input']} ${errors.website ? styles['step-form__input--error'] : ''}`}
          placeholder="https://www.business.com"
          value={formData.website}
          onChange={(e) => updateFormData({ website: e.target.value })}
        />
        {errors.website && <span className={styles['step-form__error-message']}>{errors.website}</span>}
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="socialUrl" className={styles['step-form__label']}>Social Media URL</label>
        <input
          type="url"
          id="socialUrl"
          className={`${styles['step-form__input']} ${errors.socialUrls ? styles['step-form__input--error'] : ''}`}
          placeholder="https://facebook.com/business"
          value={formData.socialUrls?.[0] || ''}
          onChange={(e) => updateFormData({ socialUrls: [e.target.value] })}
        />
        {errors.socialUrls && <span className={styles['step-form__error-message']}>{errors.socialUrls}</span>}
      </div>

      <div className={wizardStyles['wizard__actions']}>
        <button className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--secondary']}`} onClick={prevStep}>
          Back
        </button>
        <button className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`} onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

Step2Contact.propTypes = {
  formData: PropTypes.shape({
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipCode: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    socialUrls: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default Step2Contact;
