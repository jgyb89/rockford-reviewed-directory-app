'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from './StepForm.module.css';
import wizardStyles from './ListingWizard.module.css';

const Step1General = ({ formData, updateFormData, nextStep }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = 'Business Name is required';
    if (!formData.description?.trim()) newErrors.description = 'Description is required';

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
        <span className="material-symbols-outlined" style={{ color: '#e04c4c' }}>edit</span>
        <h2>General Information</h2>
      </header>

      <div className={styles['step-form__group']}>
        <label htmlFor="title" className={styles['step-form__label']}>
          Business Name <span className={styles['step-form__required']}>*</span>
        </label>
        <input
          type="text"
          id="title"
          className={`${styles['step-form__input']} ${errors.title ? styles['step-form__input--error'] : ''}`}
          placeholder="e.g. Cape Coral Plumbing"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          required
        />
        {errors.title && <span className={styles['step-form__error-message']}>{errors.title}</span>}
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="description" className={styles['step-form__label']}>
          Description <span className={styles['step-form__required']}>*</span>
        </label>
        <textarea
          id="description"
          className={`${styles['step-form__textarea']} ${errors.description ? styles['step-form__textarea--error'] : ''}`}
          placeholder="Tell us about your business..."
          rows={5}
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          required
        />
        {errors.description && <span className={styles['step-form__error-message']}>{errors.description}</span>}
      </div>

      <div className={wizardStyles['wizard__actions']}>
        <button className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`} onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

Step1General.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
};

export default Step1General;
