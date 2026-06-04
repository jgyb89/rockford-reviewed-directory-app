'use client';

import React, { useState } from 'react';
import wizardStyles from '@/components/directory-builder/ListingWizard.module.css';
import Step1BasicInfo from './Step1BasicInfo';
import Step2Details from './Step2Details';
import Step3Media from './Step3Media';

const EventWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categories: [], // maps to eventCategories
    start_date: '',
    end_date: '',
    venue_name: '',
    event_address: '',
    price: '',
    ticket_url: '',
    featuredImage: null,
    gallery: []
  });

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));
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
        return <Step1BasicInfo {...props} />;
      case 2:
        return <Step2Details {...props} />;
      case 3:
        return <Step3Media {...props} />;
      default:
        return <Step1BasicInfo {...props} />;
    }
  };

  return (
    <div className={wizardStyles['wizard']}>
      <div className={wizardStyles['wizard__header']}>
        <ul className={wizardStyles['wizard__stepper']}>
          {[1, 2, 3].map((step) => (
            <li
              key={step}
              className={`${wizardStyles['wizard__step-indicator']} ${currentStep === step ? wizardStyles['wizard__step-indicator--active'] : ''} ${currentStep > step ? wizardStyles['wizard__step-indicator--completed'] : ''}`}
            >
              <span className={wizardStyles['wizard__step-number']}>{step}</span>
              <span className={wizardStyles['wizard__step-label']}>Step {step}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={wizardStyles['wizard__content']}>
        {renderStep()}
      </div>
    </div>
  );
};

export default EventWizard;
