'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter, useParams } from 'next/navigation';
import { createEventMutation } from '@/lib/graphql/events';
import { uploadWPImage } from '@/lib/actions';
import imageCompression from 'browser-image-compression';

import styles from '@/components/directory-builder/StepForm.module.css';
import wizardStyles from '@/components/directory-builder/ListingWizard.module.css';
import Image from 'next/image';

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: false,
    fileType: file.type
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Compression error:', error);
    return file;
  }
};

const Step3Media = ({ formData, updateFormData, prevStep }) => {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';
  
  const [fileErrors, setFileErrors] = useState({ featured: "" });
  const [uploadStep, setUploadStep] = useState('idle'); // idle, compressing, uploading, saving, complete

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files.length > 0) {
      updateFormData({ [field]: e.target.files[0] });
      setFileErrors({ ...fileErrors, [field]: "" });
    }
  };

  const removeImage = (field) => {
    updateFormData({ [field]: null });
  };

  const handleSubmit = async () => {
    setUploadStep('compressing');

    try {
      let featuredImageId = '';
      if (formData.featuredImage) {
        const compressedFeatured = await compressImage(formData.featuredImage);
        setUploadStep('uploading');
        const fileData = new FormData();
        fileData.append('file', compressedFeatured);
        featuredImageId = await uploadWPImage(fileData);
      }

      setUploadStep('saving');

      // Execute createEventMutation
      const result = await createEventMutation({
        title: formData.title,
        content: formData.description,
        primaryCategory: formData.primaryCategory,
        customTags: formData.customTags,
        start_date: formData.start_date,
        end_date: formData.end_date,
        venue_name: formData.venue_name,
        event_address: formData.event_address,
        price: formData.price,
        ticket_url: formData.ticket_url,
        featuredImageId: featuredImageId ? Number.parseInt(featuredImageId, 10) : null,
      });

      if (result.success) {
        setUploadStep('complete');
        // We'll show a pending approval state before redirecting or show it inline
      } else {
        alert(`Error: ${result.message}`);
        setUploadStep('idle');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('An unexpected error occurred. Please try again.');
      setUploadStep('idle');
    }
  };

  const isSubmitting = uploadStep !== 'idle';

  let uploadMessage = 'Saving event details';
  if (uploadStep === 'compressing') {
    uploadMessage = 'Compressing images';
  } else if (uploadStep === 'uploading') {
    uploadMessage = 'Uploading media';
  }

  if (uploadStep === 'complete') {
    return (
      <div className={styles['step-form']} style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#10b981', marginBottom: '1rem' }}>
          check_circle
        </span>
        <h2>Submission Successful!</h2>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Your event submission is pending admin approval. It will appear on the site once reviewed.
        </p>
        <button 
          className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`}
          onClick={() => router.push(locale === 'es' ? '/es/dashboard/events' : '/dashboard/events')}
        >
          Go to My Events
        </button>
      </div>
    );
  }

  let progressWidth = '90%';
  if (uploadStep === 'compressing') {
    progressWidth = '33%';
  } else if (uploadStep === 'uploading') {
    progressWidth = '66%';
  }

  return (
    <div className={styles['step-form']}>
      {/* Progress Overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: '#fff',
            padding: '3rem',
            borderRadius: '16px',
            textAlign: 'center',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}>
            <style>{`
              @keyframes starBounceModal {
                0%, 40%, 100% { transform: translateY(0); }
                20% { transform: translateY(-12px); }
              }
            `}</style>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounceModal 1.5s infinite' }}>star</span>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounceModal 1.5s infinite 0.1s' }}>star</span>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounceModal 1.5s infinite 0.2s' }}>star</span>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounceModal 1.5s infinite 0.3s' }}>star</span>
              <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounceModal 1.5s infinite 0.4s' }}>star</span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>{uploadMessage}...</h3>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Please wait while we process your request.</p>
            <div style={{ width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: progressWidth,
                background: '#e04c4c',
                height: '100%',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      <header className={styles['step-form__header']}>
        <span className="material-symbols-outlined">perm_media</span>
        <h2>Event Media & Submit</h2>
      </header>

      <div className={styles['step-form__group']}>
        <div className={styles['step-form__label']}>Featured Image</div>
        
        {formData.featuredImage ? (
          <div style={{ position: "relative", width: "200px", height: "140px", borderRadius: "8px", overflow: "hidden" }}>
            <Image
              src={URL.createObjectURL(formData.featuredImage)}
              alt="Preview"
              fill
              unoptimized
              style={{ objectFit: "cover" }}
            />
            <button
              onClick={() => removeImage('featuredImage')}
              style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
            </button>
          </div>
        ) : (
          <div style={{ border: '2px dashed #cbd5e1', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
            <input
              type="file"
              id="featuredImage"
              accept="image/jpeg, image/png, image/webp"
              onChange={(e) => handleFileChange(e, "featuredImage")}
              style={{ display: "none" }}
            />
            <label htmlFor="featuredImage" style={{ cursor: "pointer", color: "#1e293b", fontWeight: 600 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', display: 'block' }}>add_photo_alternate</span>
              {' '}Click to Browse Files
            </label>
          </div>
        )}
      </div>

      <div className={styles['step-form__summary']} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee', marginTop: '2rem' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Summary</h3>
        <p><strong>Title:</strong> {formData.title}</p>
        <p><strong>Date:</strong> {formData.start_date}</p>
        <p><strong>Venue:</strong> {formData.venue_name}</p>
      </div>

      <div className={wizardStyles['wizard__actions']}>
        <style>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          @keyframes starBounce {
            0%, 40%, 100% { transform: translateY(0); }
            20% { transform: translateY(-6px); }
          }
        `}</style>
        <button
          className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--secondary']}`}
          onClick={prevStep}
          disabled={isSubmitting}
        >
          Back
        </button>
        <button
          className={`${wizardStyles['wizard__button']} ${wizardStyles['wizard__button--primary']}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={{ 
            backgroundColor: isSubmitting ? '#f8fafc' : '#e04c4c',
            color: isSubmitting ? '#e04c4c' : '#fff',
            border: isSubmitting ? '1px solid #e04c4c' : '1px solid transparent',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem'
          }}
        >
          {isSubmitting ? (
            <>
              <div style={{ display: 'flex', gap: '2px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounce 1.5s infinite' }}>star</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounce 1.5s infinite 0.1s' }}>star</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounce 1.5s infinite 0.2s' }}>star</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounce 1.5s infinite 0.3s' }}>star</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#e04c4c', fontVariationSettings: "'FILL' 1", animation: 'starBounce 1.5s infinite 0.4s' }}>star</span>
              </div>
              <span style={{ color: '#e04c4c', fontWeight: 600 }}>Processing...</span>
            </>
          ) : 'Submit Event'}
        </button>
      </div>
    </div>
  );
};

Step3Media.propTypes = {
  formData: PropTypes.shape({
    featuredImage: PropTypes.any,
    title: PropTypes.string,
    description: PropTypes.string,
    primaryCategory: PropTypes.string,
    customTags: PropTypes.arrayOf(PropTypes.string),
    start_date: PropTypes.string,
    end_date: PropTypes.string,
    venue_name: PropTypes.string,
    event_address: PropTypes.shape({
      address: PropTypes.string,
      lat: PropTypes.number,
      lng: PropTypes.number,
    }),
    price: PropTypes.string,
    ticket_url: PropTypes.string,
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default Step3Media;
