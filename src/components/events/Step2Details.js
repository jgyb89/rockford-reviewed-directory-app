'use client';

import React, { useState } from 'react';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import styles from '@/components/directory-builder/StepForm.module.css';
import wizardStyles from '@/components/directory-builder/ListingWizard.module.css';

const libraries = ['places'];

const Step2Details = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const [autocomplete, setAutocomplete] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.start_date) newErrors.start_date = 'Start Date is required';
    if (!formData.venue_name) newErrors.venue_name = 'Venue Name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      nextStep();
    }
  };

  const onLoad = (autoC) => setAutocomplete(autoC);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        updateFormData({
          event_address: {
            address: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        });
      }
    }
  };

  return (
    <div className={styles['step-form']}>
      <header className={styles['step-form__header']}>
        <span className="material-symbols-outlined">event</span>
        <h2>Event Details</h2>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles['step-form__group']}>
          <label htmlFor="start_date" className={styles['step-form__label']}>Start Date/Time *</label>
          <input
            type="datetime-local"
            id="start_date"
            className={`${styles['step-form__input']} ${errors.start_date ? styles['step-form__input--error'] : ''}`}
            value={formData.start_date}
            onChange={(e) => updateFormData({ start_date: e.target.value })}
          />
          {errors.start_date && <span className={styles['step-form__error-message']}>{errors.start_date}</span>}
        </div>
        <div className={styles['step-form__group']}>
          <label htmlFor="end_date" className={styles['step-form__label']}>End Date/Time</label>
          <input
            type="datetime-local"
            id="end_date"
            className={styles['step-form__input']}
            value={formData.end_date}
            onChange={(e) => updateFormData({ end_date: e.target.value })}
          />
        </div>
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="venue_name" className={styles['step-form__label']}>Venue Name *</label>
        <input
          type="text"
          id="venue_name"
          className={`${styles['step-form__input']} ${errors.venue_name ? styles['step-form__input--error'] : ''}`}
          placeholder="E.g., Cape Coral Yacht Club"
          value={formData.venue_name}
          onChange={(e) => updateFormData({ venue_name: e.target.value })}
        />
        {errors.venue_name && <span className={styles['step-form__error-message']}>{errors.venue_name}</span>}
      </div>

      <div className={styles['step-form__group']}>
        <label htmlFor="event_address" className={styles['step-form__label']}>Street Address</label>
        {isLoaded ? (
          <Autocomplete 
            onLoad={onLoad} 
            onPlaceChanged={onPlaceChanged}
            options={{ fields: ["address_components", "geometry", "name", "formatted_address"] }}
          >
            <input
              type="text"
              id="event_address"
              className={styles['step-form__input']}
              placeholder="123 Example St, Cape Coral, FL"
              value={formData.event_address?.address || ''}
              onChange={(e) => updateFormData({
                event_address: { ...formData.event_address, address: e.target.value }
              })}
            />
          </Autocomplete>
        ) : (
          <input
            type="text"
            id="event_address"
            className={styles['step-form__input']}
            placeholder="Loading map..."
            disabled
          />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className={styles['step-form__group']}>
          <label htmlFor="price" className={styles['step-form__label']}>Price</label>
          <input
            type="text"
            id="price"
            className={styles['step-form__input']}
            placeholder="E.g., $15 or Free"
            value={formData.price}
            onChange={(e) => updateFormData({ price: e.target.value })}
          />
        </div>
        <div className={styles['step-form__group']}>
          <label htmlFor="ticket_url" className={styles['step-form__label']}>Ticket URL</label>
          <input
            type="url"
            id="ticket_url"
            className={styles['step-form__input']}
            placeholder="https://"
            value={formData.ticket_url}
            onChange={(e) => updateFormData({ ticket_url: e.target.value })}
          />
        </div>
      </div>

      <div className={wizardStyles['wizard__actions']}>
        <button type="button" className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--secondary']}`} onClick={prevStep}>
          Back
        </button>
        <button type="button" className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`} onClick={handleNext}>
          Next Step
        </button>
      </div>
    </div>
  );
};

export default Step2Details;
