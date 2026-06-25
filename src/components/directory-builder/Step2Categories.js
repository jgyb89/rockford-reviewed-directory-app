'use client';

import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styles from './StepForm.module.css';
import wizardStyles from './ListingWizard.module.css';
import { ALL_CATEGORIES, DIRECTORY_TYPES } from '@/lib/constants';

const Step2Categories = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});


  const [catInput, setCatInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleDirectoryTypeChange = (typeSlug) => {
    updateFormData({ 
      category: typeSlug,
      categories: [] // Clear subcategories
    });
  };

  const handleCategoryToggle = (slug) => {
    const current = formData.categories || [];
    if (current.includes(slug)) {
      updateFormData({ categories: current.filter(c => c !== slug) });
    } else {
      updateFormData({ categories: [...current, slug] });
    }
  };

  const availableChildCategories = useMemo(() => {
    if (!formData.category) return [];
    return ALL_CATEGORIES.filter(cat => 
      cat.parentSlug === formData.category
    );
  }, [formData.category]);

  const validate = () => {
    const newErrors = {};
    if (!formData.category) newErrors.directoryType = 'Directory Type is required';
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
        <div className={styles['step-form__label']}>
          Directory Type <span className={styles['step-form__required']}>*</span>
        </div>
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

      {/* Sub Category Selection */}
      {formData.category && (
        <div className={styles['category-section']}>
          <div className={styles['section-label']}>Select Category</div>
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
                  <li key={suggestion.slug}>
                    <button
                      type="button"
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
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.6rem 1rem',
                        cursor: 'pointer',
                        fontSize: '0.95rem',
                        color: '#1e293b',
                        transition: 'background-color 0.2s',
                        background: 'none',
                        border: 'none',
                        fontFamily: 'inherit'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      onFocus={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                      onBlur={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <span style={{ fontWeight: 600 }}>{suggestion.name.slice(0, catInput.length)}</span>
                      <span>{suggestion.name.slice(catInput.length)}</span>
                    </button>
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

Step2Categories.propTypes = {
  formData: PropTypes.shape({
    category: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default Step2Categories;
