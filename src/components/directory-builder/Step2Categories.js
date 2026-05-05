'use client';

import React, { useState, useMemo, useEffect } from 'react';
import styles from './StepForm.module.css';
import wizardStyles from './ListingWizard.module.css';
import { ALL_CATEGORIES, DIRECTORY_TYPES } from '@/lib/constants';

const Step2Categories = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const [selectedParentCategory, setSelectedParentCategory] = useState(null);
  const [catInput, setCatInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Initialize selectedParentCategory if categories already exist (for edit/back navigation)
  useEffect(() => {
    if (formData.categories?.length > 0) {
      const firstCatSlug = formData.categories[0];
      const childCat = ALL_CATEGORIES.find(c => c.slug === firstCatSlug);
      if (childCat?.parentSlug) {
        const parent = ALL_CATEGORIES.find(c => c.slug === childCat.parentSlug);
        setSelectedParentCategory(parent);
      }
    }
  }, [formData.categories]);

  const handleDirectoryTypeChange = (typeSlug) => {
    updateFormData({ 
      category: typeSlug,
      categories: [] // Clear subcategories
    });
    setSelectedParentCategory(null); // Reset parent
  };

  const handleParentCategoryChange = (parent) => {
    setSelectedParentCategory(parent);
    updateFormData({ categories: [] }); // Clear subcategories when parent changes
  };

  const handleCategoryToggle = (slug) => {
    const current = formData.categories || [];
    if (current.includes(slug)) {
      updateFormData({ categories: current.filter(c => c !== slug) });
    } else {
      updateFormData({ categories: [...current, slug] });
    }
  };

  const availableParentCategories = useMemo(() => {
    if (!formData.category) return [];
    return ALL_CATEGORIES.filter(cat => 
      cat.directoryType === formData.category && cat.isParent
    );
  }, [formData.category]);

  const availableChildCategories = useMemo(() => {
    if (!selectedParentCategory) return [];
    return ALL_CATEGORIES.filter(cat => 
      cat.parentSlug === selectedParentCategory.slug
    );
  }, [selectedParentCategory]);

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.directoryType = 'Directory Type is required';
    if (!selectedParentCategory) newErrors.parentCategory = 'Main Category is required';
    if (!formData.categories || formData.categories.length === 0) newErrors.categories = 'At least one sub-category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  // Filter search results based on input, ignoring ones already selected
  const searchResults = useMemo(() => {
    if (!catInput.trim()) return [];
    return ALL_CATEGORIES.filter(cat => 
      !cat.isParent &&
      cat.name.toLowerCase().includes(catInput.toLowerCase()) && 
      !(formData.categories || []).includes(cat.slug)
    );
  }, [catInput, formData.categories]);

  return (
    <div className={styles['step-form']}>
      <header className={styles['step-form__header']}>
        <span className="material-symbols-outlined" style={{ color: '#e04c4c' }}>category</span>
        <h2>Select Categories</h2>
      </header>

      {/* Directory Type Selection */}
      <div className={styles['step-form__group']}>
        <label className={styles['step-form__label']}>
          Directory Type <span className={styles['step-form__required']}>*</span>
        </label>
        <div className={styles['pill-container']} style={{ marginTop: '0.5rem' }}>
          {DIRECTORY_TYPES.map(type => (
            <button
              key={type.slug}
              type="button"
              className={`${styles['category-pill']} ${formData.category === type.slug ? styles['category-pill--active'] : ''}`}
              onClick={() => handleDirectoryTypeChange(type.slug)}
            >
              {type.name}
            </button>
          ))}
        </div>
        {errors.directoryType && <span className={styles['step-form__error-message']}>{errors.directoryType}</span>}
      </div>

      {/* Main Category Selection */}
      {formData.category && (
        <div className={styles['category-section']}>
          <label className={styles['section-label']}>Main Category</label>
          <div className={styles['pill-container']}>
            {availableParentCategories.map(parent => (
              <button
                key={parent.slug}
                type="button"
                className={`${styles['category-pill']} ${selectedParentCategory?.slug === parent.slug ? styles['category-pill--active'] : ''}`}
                onClick={() => handleParentCategoryChange(parent)}
              >
                {parent.name}
              </button>
            ))}
          </div>
          {errors.parentCategory && <span className={styles['step-form__error-message']}>{errors.parentCategory}</span>}
        </div>
      )}

      {/* Sub Category Selection */}
      {selectedParentCategory && (
        <div className={styles['category-section']}>
          <label className={styles['section-label']}>Select Category</label>
          <div className={styles['pill-container']}>
            {availableChildCategories.map(child => (
              <button
                key={child.slug}
                type="button"
                className={`${styles['category-pill']} ${formData.categories?.includes(child.slug) ? styles['category-pill--active'] : ''}`}
                onClick={() => handleCategoryToggle(child.slug)}
              >
                {child.name}
              </button>
            ))}
          </div>

          {/* Search Bar for Subcategories */}
          <div style={{ position: 'relative', marginTop: '1rem' }}>
            <input
              type="text"
              className={styles['step-form__input']}
              placeholder="Search more subcategories..."
              value={catInput}
              onChange={(e) => {
                setCatInput(e.target.value);
                setIsFocused(true);
              }}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              style={{ width: '100%' }}
            />
            
            {isFocused && catInput.trim() && searchResults.length > 0 && (
              <ul style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', listStyle: 'none',
                padding: '0.5rem 0', margin: '0.25rem 0 0 0', zIndex: 50,
                maxHeight: '220px', overflowY: 'auto'
              }}>
                {searchResults.map(suggestion => (
                  <li
                    key={suggestion.slug}
                    tabIndex={0}
                    role="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCategoryToggle(suggestion.slug);
                      setCatInput('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCategoryToggle(suggestion.slug);
                        setCatInput('');
                      }
                    }}
                    style={{
                      padding: '0.6rem 1rem', cursor: 'pointer',
                      fontSize: '0.95rem', color: '#1e293b', transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onFocus={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                    onBlur={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ fontWeight: 600 }}>{suggestion.name.slice(0, catInput.length)}</span>
                    <span>{suggestion.name.slice(catInput.length)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {errors.categories && <span className={styles['step-form__error-message']}>{errors.categories}</span>}
        </div>
      )}

      <div className={wizardStyles['wizard__actions']}>
        <button className={wizardStyles['wizard__button']} onClick={prevStep}>
          Back
        </button>
        <button className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`} onClick={handleNext}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Step2Categories;
