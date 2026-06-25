'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import styles from '@/components/directory-builder/StepForm.module.css';
import wizardStyles from '@/components/directory-builder/ListingWizard.module.css';

const libraries = ['places'];

const Step2Details = ({ formData, updateFormData, nextStep, prevStep }) => {
  const [errors, setErrors] = useState({});
  const [autocomplete, setAutocomplete] = useState(null);
  const [tempInputs, setTempInputs] = useState({});

  // Helper to split a standard ISO-like string (YYYY-MM-DDTHH:mm)
  const parseDateTime = (dtStr) => {
    if (!dtStr) return { date: '', time: '12:00', ampm: 'AM' };
    const [date, timePart] = dtStr.split('T');
    if (!timePart) return { date, time: '12:00', ampm: 'AM' };
    let [h, m] = timePart.split(':');
    h = Number.parseInt(h, 10);
    let ampm = 'AM';
    if (h >= 12) {
      ampm = 'PM';
      if (h > 12) h -= 12;
    } else if (h === 0) {
      h = 12;
    }
    return { date, time: `${h}:${m || '00'}`, ampm };
  };

  // Helper to combine back to YYYY-MM-DDTHH:mm
  const formatDateTime = (date, timeStr, ampm) => {
    if (!date) return ''; // Can't form without date
    let [h, m] = timeStr.split(':');
    h = Number.parseInt(h, 10);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const hh = String(h).padStart(2, '0');
    const mm = String(m || '0').padStart(2, '0');
    return `${date}T${hh}:${mm}`;
  };

  const parseTimeInput = (val, currentAmPm) => {
    const digits = val.replace(/\D/g, '');
    if (!digits) return { time: '12:00', ampm: currentAmPm };

    let h, m = 0;
    if (digits.length <= 2) {
      h = Number.parseInt(digits, 10);
    } else {
      const splitAt = digits.length === 3 ? 1 : 2;
      h = Number.parseInt(digits.slice(0, splitAt), 10);
      m = Math.min(Number.parseInt(digits.slice(splitAt, splitAt + 2), 10), 59);
    }

    h = Math.min(h, 24);
    let ampm = currentAmPm;

    if (h === 0 || h === 24) {
      h = 12;
      ampm = 'AM';
    } else if (h >= 12) {
      ampm = 'PM';
      if (h > 12) h -= 12;
    }

    return { time: `${h}:${m.toString().padStart(2, '0')}`, ampm };
  };

  const handleTimeBlur = (field, value) => {
    const currentDtStr = formData[field];
    const { date, ampm } = parseDateTime(currentDtStr);
    
    const parsed = parseTimeInput(value, ampm);
    const fallbackDate = new Date().toISOString().split('T')[0];
    const newDtStr = formatDateTime(date || fallbackDate, parsed.time, parsed.ampm);
    
    updateFormData({ [field]: newDtStr });

    setTempInputs(prev => {
      const newState = { ...prev };
      delete newState[field];
      return newState;
    });
  };

  const handleDateChange = (field, newDate) => {
    const { time, ampm } = parseDateTime(formData[field]);
    const newDtStr = formatDateTime(newDate, time, ampm);
    updateFormData({ [field]: newDtStr });
  };

  const handleAmPmChange = (field, newAmPm) => {
    const { date, time } = parseDateTime(formData[field]);
    const fallbackDate = new Date().toISOString().split('T')[0];
    const newDtStr = formatDateTime(date || fallbackDate, time, newAmPm);
    updateFormData({ [field]: newDtStr });
  };

  const renderDateTimeField = (field, label, required) => {
    const { date, time, ampm } = parseDateTime(formData[field]);
    const displayTime = tempInputs[field] !== undefined ? tempInputs[field] : time;
    const errorMsg = errors[field];

    return (
      <div className={styles['step-form__group']}>
        <div className={styles['step-form__label']}>{label} {required && '*'}</div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="date"
            className={`${styles['step-form__input']} ${errorMsg ? styles['step-form__input--error'] : ''}`}
            style={{ flex: 2 }}
            value={date}
            onChange={(e) => handleDateChange(field, e.target.value)}
          />
          <input
            type="text"
            className={styles['step-form__input']}
            style={{ width: '80px', textAlign: 'center' }}
            value={displayTime}
            onChange={(e) => setTempInputs(prev => ({ ...prev, [field]: e.target.value }))}
            onBlur={(e) => handleTimeBlur(field, e.target.value)}
            placeholder="12:00"
          />
          <select
            className={styles['step-form__select']}
            style={{ width: 'auto' }}
            value={ampm}
            onChange={(e) => handleAmPmChange(field, e.target.value)}
          >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
        {errorMsg && <span className={styles['step-form__error-message']}>{errorMsg}</span>}
      </div>
    );
  };

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
      if (formData.is_recurring) {
        let ruleParts = [`FREQ=${formData.recurrence_freq || 'WEEKLY'}`];
        if (formData.recurrence_until) {
          const untilDate = new Date(formData.recurrence_until);
          // Set to end of day to include the final date fully
          untilDate.setHours(23, 59, 59);
          const untilStr = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          ruleParts.push(`UNTIL=${untilStr}`);
        }
        
        const isWeeklyOrEmpty = formData.recurrence_freq === 'WEEKLY' || !formData.recurrence_freq;
        if (isWeeklyOrEmpty && formData.recurrence_byday?.length > 0) {
          ruleParts.push(`BYDAY=${formData.recurrence_byday.join(',')}`);
        }
        updateFormData({ recurrence_rule: ruleParts.join(';') });
      } else {
        updateFormData({ recurrence_rule: '' });
      }
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1rem' }}>
        {renderDateTimeField('start_date', 'Start Date/Time', true)}
        {renderDateTimeField('end_date', 'End Date/Time', false)}

        {/* Recurring Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="is_recurring" 
            checked={formData.is_recurring || false}
            onChange={(e) => updateFormData({ is_recurring: e.target.checked })}
            style={{ width: 'auto', margin: 0, cursor: 'pointer', transform: 'scale(1.2)' }}
          />
          <label htmlFor="is_recurring" style={{ margin: 0, fontWeight: 600, cursor: 'pointer' }}>This is a recurring event</label>
        </div>

        {/* Recurring Options */}
        {formData.is_recurring && (
          <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className={styles['step-form__group']}>
              <label htmlFor="recurrence_freq" className={styles['step-form__label']}>Repeats</label>
              <select 
                id="recurrence_freq"
                className={styles['step-form__select']}
                value={formData.recurrence_freq || 'WEEKLY'}
                onChange={(e) => updateFormData({ recurrence_freq: e.target.value })}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            {(formData.recurrence_freq === 'WEEKLY' || !formData.recurrence_freq) && (
              <div className={styles['step-form__group']}>
                <div className={styles['step-form__label']}>On these days</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[{label: 'S', val: 'SU'}, {label: 'M', val: 'MO'}, {label: 'T', val: 'TU'}, {label: 'W', val: 'WE'}, {label: 'T', val: 'TH'}, {label: 'F', val: 'FR'}, {label: 'S', val: 'SA'}].map((day) => {
                    const isActive = (formData.recurrence_byday || []).includes(day.val);
                    return (
                      <button
                        key={day.val}
                        type="button"
                        onClick={() => {
                          const current = formData.recurrence_byday || [];
                          if (isActive) {
                            updateFormData({ recurrence_byday: current.filter(d => d !== day.val) });
                          } else {
                            updateFormData({ recurrence_byday: [...current, day.val] });
                          }
                        }}
                        style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          border: isActive ? 'none' : '1px solid #ccc',
                          backgroundColor: isActive ? '#0070f3' : '#fff',
                          color: isActive ? 'white' : '#333',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s ease'
                        }}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className={styles['step-form__group']}>
              <label htmlFor="recurrence_until" className={styles['step-form__label']}>Ends on (Optional)</label>
              <input 
                id="recurrence_until"
                type="date"
                className={styles['step-form__input']}
                value={formData.recurrence_until || ''}
                onChange={(e) => updateFormData({ recurrence_until: e.target.value })}
              />
            </div>
          </div>
        )}
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
        <button 
          type="button" 
          className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`} 
          onClick={handleNext}
          disabled={!formData.start_date || !formData.venue_name}
          style={{ 
            opacity: (!formData.start_date || !formData.venue_name) ? 0.5 : 1,
            cursor: (!formData.start_date || !formData.venue_name) ? 'not-allowed' : 'pointer'
          }}
        >
          Next Step
        </button>
      </div>
    </div>
  );
};

Step2Details.propTypes = {
  formData: PropTypes.shape({
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    venue_name: PropTypes.string,
    is_recurring: PropTypes.bool,
    recurrence_freq: PropTypes.string,
    recurrence_until: PropTypes.string,
    recurrence_byday: PropTypes.arrayOf(PropTypes.string),
    recurrence_rule: PropTypes.string,
    event_address: PropTypes.shape({
      address: PropTypes.string,
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    price: PropTypes.string,
    ticket_url: PropTypes.string,
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default Step2Details;
