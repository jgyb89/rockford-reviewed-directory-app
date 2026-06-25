'use client';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import { submitListing, uploadWPImage } from '@/lib/actions';

import imageCompression from 'browser-image-compression';
import styles from './StepForm.module.css';
import wizardStyles from './ListingWizard.module.css';
const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: false,
    fileType: file.type // Force the library to maintain the original MIME type
  };

  try {
    const compressedBlob = await imageCompression(file, options);

    // CRITICAL FIX: The compression library can return a Blob that loses filename metadata
    // when passed through a Next.js Server Action. WordPress rejects files without extensions.
    // We must re-wrap the output in a strict File object using the original file's name and type.
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now()
    });
  } catch (error) {
    console.error('Compression error:', error);
    return file;
  }
};

const Step5Finish = ({ formData, prevStep }) => {
  const router = useRouter();
  const [uploadStep, setUploadStep] = useState('idle'); // idle, compressing, uploading_featured, uploading_gallery, saving_data, complete

  const handleSubmit = async () => {
    setUploadStep('compressing');

    try {
      // 1. Compression
      let compressedFeatured = null;
      if (formData.featuredImage) {
        compressedFeatured = await compressImage(formData.featuredImage);
      }
      
      const compressedGallery = await Promise.all(
        (formData.gallery || []).map(file => compressImage(file))
      );

      // 2. Upload Featured Image
      setUploadStep('uploading_featured');
      let featuredImageId = '';
      if (compressedFeatured) {
        const fileData = new FormData();
        fileData.append('file', compressedFeatured);
        featuredImageId = await uploadWPImage(fileData);
      }

      // 3. Parallel Upload Gallery Images
      setUploadStep('uploading_gallery');
      const galleryIds = [];
      if (compressedGallery.length > 0) {
        const uploadedIds = await Promise.all(
          compressedGallery.map(async (file) => {
            const fileData = new FormData();
            fileData.append('file', file);
            return await uploadWPImage(fileData);
          })
        );
        galleryIds.push(...uploadedIds.filter(id => !!id));
      }

      // 4. Submit Listing Data
      setUploadStep('saving_data');
      const submissionData = {
        businessName: formData.title,
        city: formData.city || '',
        state: formData.state || '',
        zipCode: formData.zipCode || '',
        priceRange: '', 
        phoneNumber: formData.phone,
        businessEmail: formData.email || '',
        websiteUrl: formData.website || '',
        videoUrl: formData.videoUrl || '',
        socialUrl: formData.socialUrls?.[0] || '',
        hoursMonday: formData.hours?.Monday || '',
        hoursTuesday: formData.hours?.Tuesday || '',
        hoursWednesday: formData.hours?.Wednesday || '',
        hoursThursday: formData.hours?.Thursday || '',
        hoursFriday: formData.hours?.Friday || '',
        hoursSaturday: formData.hours?.Saturday || '',
        hoursSunday: formData.hours?.Sunday || '',
        businessDescription: formData.description,
        streetAddress: formData.address,
        directoryType: formData.category,
        categories: formData.categories,
        featuredImage: featuredImageId ? featuredImageId.toString() : '',
        galleryImages: galleryIds.length > 0 ? galleryIds.join(',') : ''
      };

      const result = await submitListing(submissionData);

      if (result.success) {
        setUploadStep('complete');
        router.push(`/submission-success`);
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

  const stepsInfo = {
    idle: { label: '', icon: '' },
    compressing: { label: '1. Compressing Images...', icon: 'compress' },
    uploading_featured: { label: '2. Uploading Featured Image...', icon: 'upload' },
    uploading_gallery: { label: '3. Uploading Gallery Images...', icon: 'cloud_upload' },
    saving_data: { label: '4. Finalizing Listing Details...', icon: 'save' },
    complete: { label: '5. Complete!', icon: 'check_circle' }
  };

  const isSubmitting = uploadStep !== 'idle';

  let progressWidth = '90%';
  if (uploadStep === 'compressing') {
    progressWidth = '25%';
  } else if (uploadStep === 'uploading_featured') {
    progressWidth = '50%';
  } else if (uploadStep === 'uploading_gallery') {
    progressWidth = '75%';
  }

  return (
    <div className={styles['step-form']}>
      {/* Progress Overlay Modal */}
      {uploadStep !== 'idle' && uploadStep !== 'complete' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
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
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1e293b' }}>{stepsInfo[uploadStep].label}</h3>
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
        <span className="material-symbols-outlined">task_alt</span>
        <h2>Review & Submit</h2>
      </header>

      <div className={styles['step-form__summary']} style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee' }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '1px solid #ddd', paddingBottom: '0.5rem' }}>Listing Summary</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem', fontSize: '0.95rem' }}>
          <span style={{ fontWeight: 600 }}>Title:</span>
          <span>{formData.title}</span>
          
          <span style={{ fontWeight: 600 }}>Directory Type:</span>
          <span>{formData.category}</span>

          <span style={{ fontWeight: 600 }}>Categories:</span>
          <span>{(formData.categories || []).join(', ') || 'None assigned'}</span>
          
          <span style={{ fontWeight: 600 }}>Address:</span>
          <span>{formData.address}, {formData.city} {formData.state} {formData.zipCode}</span>
          
          <span style={{ fontWeight: 600 }}>Phone:</span>
          <span>{formData.phone}</span>
          
          <span style={{ fontWeight: 600 }}>Email:</span>
          <span>{formData.email || 'N/A'}</span>
          
          <span style={{ fontWeight: 600 }}>Website:</span>
          <span>{formData.website || 'N/A'}</span>
        </div>
      </div>

      <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '1.5rem' }}>
        By submitting this listing, you agree to our terms of service and confirm that the information provided is accurate.
      </p>

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
          ) : 'Submit Listing'}
        </button>
      </div>
    </div>
  );
};

Step5Finish.propTypes = {
  formData: PropTypes.shape({
    title: PropTypes.string,
    category: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    address: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipCode: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    videoUrl: PropTypes.string,
    socialUrls: PropTypes.arrayOf(PropTypes.string),
    description: PropTypes.string,
    featuredImage: PropTypes.any,
    gallery: PropTypes.arrayOf(PropTypes.any),
    hours: PropTypes.shape({
      Monday: PropTypes.string,
      Tuesday: PropTypes.string,
      Wednesday: PropTypes.string,
      Thursday: PropTypes.string,
      Friday: PropTypes.string,
      Saturday: PropTypes.string,
      Sunday: PropTypes.string,
    }),
  }).isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default Step5Finish;
