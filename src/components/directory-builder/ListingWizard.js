'use client';

import React, { useState } from 'react';
import styles from './ListingWizard.module.css';
import Step1General from './Step1General';
import Step2Categories from './Step2Categories';
import Step2Contact from './Step2Contact';
import Step3Hours from './Step3Hours';
import Step4Media from './Step4Media';
import Step5Finish from './Step5Finish';

const ListingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: '', // Represents the top-level Directory Type
    categories: [], // Holds the specific sub-categories
    description: '',
    address: '',
    city: 'Rockford',
    state: 'IL',
    phone: '',
    email: '',
    website: '',
    socialUrls: [],
    timezone: 'America/Chicago',
    hours: {},
    featuredImage: null,
    gallery: [],
    videoUrl: ''
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 6));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const updateFormData = (newData) => {
    setFormData((prev) => ({
      ...prev,
      ...newData
    }));
  };

  const renderStep = () => {
    const props = { formData, updateFormData, nextStep, prevStep };
    switch (currentStep) {
      case 1:
        return <Step1General {...props} />;
      case 2:
        return <Step2Categories {...props} />;
      case 3:
        return <Step2Contact {...props} />;
      case 4:
        return <Step3Hours {...props} />;
      case 5:
        return <Step4Media {...props} />;
      case 6:
        return <Step5Finish {...props} />;
      default:
        return <Step1General {...props} />;
    }
  };

  return (
    <div className={styles['wizard']}>
      <div className={styles['wizard__header']}>
        <ul className={styles['wizard__stepper']}>
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <li
              key={step}
              className={`${styles['wizard__step-indicator']} ${currentStep === step ? styles['wizard__step-indicator--active'] : ''} ${currentStep > step ? styles['wizard__step-indicator--completed'] : ''}`}
            >
              <span className={styles['wizard__step-number']}>{step}</span>
              <span className={styles['wizard__step-label']}>Step {step}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={styles['wizard__content']}>
        {renderStep()}
      </div>
    </div>
  );
};

export default ListingWizard;
