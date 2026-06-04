'use client';

import React, { useState } from 'react';
import styles from '@/components/directory-builder/StepForm.module.css';
import wizardStyles from '@/components/directory-builder/ListingWizard.module.css';

const Step1BasicInfo = ({ formData, updateFormData, nextStep }) => {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.categories.length === 0) newErrors.categories = 'At least one category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  const [categoryInput, setCategoryInput] = useState(formData.categories.join(', '));

  const handleCategoryChange = (e) => {
    const val = e.target.value;
    setCategoryInput(val);
    updateFormData({ categories: val.split(',').map(s => s.trim()).filter(Boolean) });
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
        <label htmlFor="categories" className={styles['step-form__label']}>Category (slugs comma separated) *</label>
        <input
          type="text"
          id="categories"
          className={`${styles['step-form__input']} ${errors.categories ? styles['step-form__input--error'] : ''}`}
          placeholder="E.g., music, festival"
          value={categoryInput}
          onChange={handleCategoryChange}
        />
        {errors.categories && <span className={styles['step-form__error-message']}>{errors.categories}</span>}
        <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>For this demo, simply enter category slugs separated by commas.</p>
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

export default Step1BasicInfo;
