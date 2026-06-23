'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createEventMutation } from '@/lib/graphql/events';
import { uploadWPImage } from '@/lib/actions';
import imageCompression from 'browser-image-compression';
import { Loader2 } from 'lucide-react';
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
        featuredImageId: featuredImageId ? parseInt(featuredImageId) : null,
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

  return (
    <div className={styles['step-form']}>
      {/* Progress Overlay */}
      {isSubmitting && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ backgroundColor: '#fff', padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Processing...</h3>
            <p>{uploadStep === 'compressing' ? 'Compressing images' : uploadStep === 'uploading' ? 'Uploading media' : 'Saving event details'}</p>
          </div>
        </div>
      )}

      <header className={styles['step-form__header']}>
        <span className="material-symbols-outlined">perm_media</span>
        <h2>Event Media & Submit</h2>
      </header>

      <div className={styles['step-form__group']}>
        <label className={styles['step-form__label']}>Featured Image</label>
        
        {!formData.featuredImage ? (
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
              Click to Browse Files
            </label>
          </div>
        ) : (
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
            backgroundColor: isSubmitting ? '#ccc' : '#e04c4c',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '0.5rem'
          }}
        >
          {isSubmitting ? (
            <>
              <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
              Processing...
            </>
          ) : 'Submit Event'}
        </button>
      </div>
    </div>
  );
};

export default Step3Media;
