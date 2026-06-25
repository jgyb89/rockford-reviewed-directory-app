'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styles from '@/components/directory-builder/StepForm.module.css';
import wizardStyles from '@/components/directory-builder/ListingWizard.module.css';
import { EVENT_CATEGORIES } from "@/lib/constants/events";

const Step1BasicInfo = ({ formData, updateFormData, nextStep }) => {
  const [errors, setErrors] = useState({});
  const initialCustom = (formData.customTags || []).join(', ');

  const [customTagsText, setCustomTagsText] = useState(initialCustom);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.primaryCategory) newErrors.primaryCategory = 'Please select a main category';
    
    const tagsArr = customTagsText.split(',').map(s => s.trim()).filter(Boolean);
    if (tagsArr.length > 3) newErrors.customTags = 'Maximum of 3 custom tags allowed';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  const handleCustomTagsChange = (e) => {
    const val = e.target.value;
    setCustomTagsText(val);
    const tagsArr = val.split(',').map(s => s.trim()).filter(Boolean);
    updateFormData({ customTags: tagsArr });
  };

  return (
    <div className={styles['step-form']}>
      <header className={styles['step-form__header']}>
        <span className="material-symbols-outlined">info</span>
        <h2>Basic Info</h2>
      </header>

      <div className={styles['step-form__group']}>
        <label htmlFor="title" className={styles['step-form__label']}>Event Title *</label>
        <input
          type="text"
          id="title"
          className={`${styles['step-form__input']} ${errors.title ? styles['step-form__input--error'] : ''}`}
          placeholder="E.g., Cape Coral Seafood Festival"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
        />
        {errors.title && <span className={styles['step-form__error-message']}>{errors.title}</span>}
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="primaryCategory" className={styles['step-form__label']}>Primary Category *</label>
        <select
          id="primaryCategory"
          className={`${styles['step-form__input']} ${errors.primaryCategory ? styles['step-form__input--error'] : ''}`}
          value={formData.primaryCategory || ''}
          onChange={(e) => {
            updateFormData({ primaryCategory: e.target.value });
          }}
        >
          <option value="">-- Select a Category --</option>
          {EVENT_CATEGORIES.map(cat => (
            <option key={cat.slug} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        {errors.primaryCategory && <span className={styles['step-form__error-message']}>{errors.primaryCategory}</span>}
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="customTags" className={styles['step-form__label']}>Custom Tags (Optional, max 3)</label>
        <input
          type="text"
          id="customTags"
          className={`${styles['step-form__input']} ${errors.customTags ? styles['step-form__input--error'] : ''}`}
          placeholder="E.g., acoustic, outdoor"
          value={customTagsText}
          onChange={handleCustomTagsChange}
        />
        {errors.customTags && <span className={styles['step-form__error-message']}>{errors.customTags}</span>}
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>Separate multiple tags with commas.</p>
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="description" className={styles['step-form__label']}>Description *</label>
        <textarea
          id="description"
          className={`${styles['step-form__input']} ${errors.description ? styles['step-form__input--error'] : ''}`}
          placeholder="Tell us about the event..."
          rows="6"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
        ></textarea>
        {errors.description && <span className={styles['step-form__error-message']}>{errors.description}</span>}
      </div>

      <div className={wizardStyles['wizard__actions']}>
        <button
          className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`}
          onClick={handleNext}
          style={{ marginLeft: 'auto' }}
        >
          Next
        </button>
      </div>
    </div>
  );
};

Step1BasicInfo.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    primaryCategory: PropTypes.string,
    customTags: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
};

export default Step1BasicInfo;
