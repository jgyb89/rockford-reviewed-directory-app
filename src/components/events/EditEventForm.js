"use client";

import React, { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { updateEventMutation } from '@/lib/graphql/events';
import { uploadWPImage, deleteWPMedia } from '@/lib/actions';
import imageCompression from 'browser-image-compression';
import Cropper from 'react-easy-crop';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';

import { EVENT_CATEGORIES } from '@/lib/constants/events';

const libraries = ['places'];

// --- Constants & Helpers ---

const formatForInput = (acfDate) => {
  if (!acfDate) return "";
  return acfDate.replace(" ", "T").slice(0, 16);
};

const formatContentForTextarea = (html) => {
  if (!html) return "";
  return html
    .replaceAll(/<\/?p>/gi, "\n\n")
    .replaceAll(/<br\s*\/?>/gi, "\n")
    .replaceAll(/<[^>]{1,512}>/g, "")
    .trim();
};

const compressImage = async (file) => {
  const options = {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1920,
    useWebWorker: false,
    fileType: file.type,
  };
  try {
    const compressedBlob = await imageCompression(file, options);
    return new File([compressedBlob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Compression error:", error);
    return file;
  }
};

async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await new Promise((resolve, reject) => {
    const img = new globalThis.Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (error) => reject(new Error(error)));
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob], "cropped-image.jpg", { type: "image/jpeg" }));
    }, "image/jpeg");
  });
}

// --- Sub-Components ---

const SectionWrapper = ({ title, children }) => (
  <section style={{ display: "grid", gap: "1.5rem", background: "#fff", padding: "2rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
    <h2 style={{ fontSize: "1.5rem", margin: 0 }}>{title}</h2>
    {children}
  </section>
);

const ImageCropModal = ({ file, onCancel, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const imageSrc = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const onCropComplete = useCallback((_, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
    onSave(croppedFile);
  };

  if (!file) return null;

  return (
    <div className="dashboard-modal-overlay" style={{ zIndex: 1100 }}>
      <div
        className="dashboard-modal-dialog"
        style={{
          width: "90%",
          maxWidth: "600px",
          height: "600px",
          display: "flex",
          flexDirection: "column",
          padding: "1.5rem",
        }}
      >
        <h3 className="dashboard-modal-title" style={{ marginBottom: "1rem" }}>
          Crop Image
        </h3>
        <div style={{ position: "relative", flex: 1, background: "#333", borderRadius: "8px", overflow: "hidden" }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
          />
        </div>
        <div style={{ padding: "1.5rem 0" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
            Zoom: {Math.round(zoom * 100)}%
          </label>
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            style={{ width: "100%", cursor: "pointer" }}
          />
        </div>
        <div className="dashboard-modal-actions" style={{ marginTop: "auto" }}>
          <button
            type="button"
            className="dashboard-modal-btn"
            onClick={onCancel}
            style={{ border: "1px solid #e2e8f0" }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dashboard-modal-btn dashboard-modal-btn--primary"
            onClick={handleSave}
          >
            Save Crop
          </button>
        </div>
      </div>
    </div>
  );
};

const ProgressOverlay = ({ step }) => {
  const stepsInfo = {
    compressing: {
      label: "1. Compressing Images...",
      icon: "compress",
      progress: "33%",
    },
    uploading_featured: {
      label: "2. Uploading Featured Image...",
      icon: "upload",
      progress: "66%",
    },
    saving_data: {
      label: "3. Finalizing Event Details...",
      icon: "save",
      progress: "90%",
    },
  };
  if (!stepsInfo[step]) return null;
  return (
    <div className="dashboard-modal-overlay" style={{ zIndex: 1000 }}>
      <div
        className="dashboard-modal-dialog"
        style={{ textAlign: "center", padding: "3rem" }}
      >
        <div
          className="material-symbols-outlined"
          style={{
            fontSize: "4rem",
            color: "#e04c4c",
            marginBottom: "1.5rem",
            animation: "pulse 2s infinite",
          }}
        >
          {stepsInfo[step].icon}
        </div>
        <h3 className="dashboard-modal-title">{stepsInfo[step].label}</h3>
        <p className="dashboard-modal-text">
          Please wait while we process your request.
        </p>
        <div
          style={{
            width: "100%",
            background: "#f1f5f9",
            height: "8px",
            borderRadius: "4px",
            marginTop: "2rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: stepsInfo[step].progress,
              background: "#e04c4c",
              height: "100%",
              transition: "width 0.5s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default function EditEventForm({ initialData, locale }) {
  const router = useRouter();

  const [autocomplete, setAutocomplete] = useState(null);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const onLoad = useCallback((autoC) => setAutocomplete(autoC), []);

  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setFormData(prev => ({
          ...prev,
          event_address: {
            address: place.formatted_address || place.name,
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          }
        }));
      }
    }
  }, [autocomplete]);
  
  const ruleStr = initialData.eventDetails?.recurrenceRule || '';
  const ruleMap = {};
  if (ruleStr) {
    ruleStr.split(';').forEach(p => {
      const [k, v] = p.split('=');
      if (k && v) ruleMap[k] = v;
    });
  }

  // 1. Extract saved categories from WPGraphQL
  const savedCategories = initialData.eventCategories?.nodes || [];

  // 2. Identify the Primary Category (Check which saved slug matches our main constants)
  const matchedPrimary = savedCategories.find(cat => 
    EVENT_CATEGORIES.some(mainCat => mainCat.slug === cat.slug)
  );
  const initialPrimaryCategory = matchedPrimary ? matchedPrimary.slug : "";

  // 3. Filter out the primary category to leave only the Custom Tags (extracting their names)
  const initialCustomTags = savedCategories
    .filter(cat => cat.slug !== initialPrimaryCategory)
    .map(cat => cat.name);

  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: formatContentForTextarea(initialData.content),
    primaryCategory: initialPrimaryCategory,
    customTags: initialCustomTags,
    start_date: formatForInput(initialData.eventDetails?.startDateTime || initialData.eventDetails?.startDate || initialData.eventDetails?.start_date),
    end_date: formatForInput(initialData.eventDetails?.endDateTime || initialData.eventDetails?.endDate || initialData.eventDetails?.end_date),
    venue_name: initialData.eventDetails?.venueName || '',
    event_address: { 
      address: initialData.eventDetails?.eventAddress?.streetAddress || initialData.eventDetails?.eventAddress?.address || '',
      lat: initialData.eventDetails?.eventAddress?.latitude || null,
      lng: initialData.eventDetails?.eventAddress?.longitude || null,
    },
    price: initialData.eventDetails?.price || '',
    ticket_url: initialData.eventDetails?.ticketUrl || initialData.eventDetails?.ticket_url || '',
    is_recurring: initialData.eventDetails?.isRecurring || false,
    recurrence_freq: ruleMap.FREQ || 'WEEKLY',
    recurrence_byday: ruleMap.BYDAY ? ruleMap.BYDAY.split(',') : [],
    recurrence_until: ruleMap.UNTIL ? `${ruleMap.UNTIL.substring(0,4)}-${ruleMap.UNTIL.substring(4,6)}-${ruleMap.UNTIL.substring(6,8)}` : '',
    recurrence_rule: ruleStr,
  });

  const [customTagsText, setCustomTagsText] = useState(initialCustomTags.join(', '));
  const [errors, setErrors] = useState({});
  const [uploadStep, setUploadStep] = useState("idle");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [existingFeaturedImage, setExistingFeaturedImage] = useState(initialData.featuredImage?.node || null);
  const [newFeaturedImage, setNewFeaturedImage] = useState(null);
  const [mediaToDelete, setMediaToDelete] = useState([]);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [pendingCrop, setPendingCrop] = useState(null);

  const updateFormData = (newData) => setFormData(prev => ({ ...prev, ...newData }));

  const handleCustomTagsChange = (e) => {
    const val = e.target.value;
    setCustomTagsText(val);
    updateFormData({ customTags: val.split(',').map(s => s.trim()).filter(Boolean) });
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.primaryCategory) newErrors.primaryCategory = 'Please select a main category';
    if (customTagsText.split(',').filter(Boolean).length > 3) newErrors.customTags = 'Max 3 tags allowed';
    if (!formData.start_date) newErrors.start_date = 'Start Date is required';
    if (!formData.venue_name) newErrors.venue_name = 'Venue Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPendingCrop(e.target.files[0]);
      setIsCropModalOpen(true);
    }
  };

  const handleCropSave = async (croppedFile) => {
    setNewFeaturedImage(croppedFile);
    setExistingFeaturedImage(null);
    setIsCropModalOpen(false);
    setPendingCrop(null);
  };

  const handleRemoveFeatured = () => {
    if (existingFeaturedImage) {
      setMediaToDelete((prev) => [...prev, existingFeaturedImage.databaseId]);
    }
    setExistingFeaturedImage(null);
    setNewFeaturedImage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setUploadStep('compressing');
    try {
      const compFeatured = newFeaturedImage ? await compressImage(newFeaturedImage) : null;
      
      for (const id of mediaToDelete) await deleteWPMedia(id);
      
      let featuredImageId = existingFeaturedImage?.databaseId || null;
      
      if (compFeatured) {
        setUploadStep('uploading_featured');
        const fd = new FormData();
        fd.append('file', compFeatured);
        featuredImageId = await uploadWPImage(fd);
      }
      
      setUploadStep('saving_data');
      
      let finalRule = '';
      if (formData.is_recurring) {
        let ruleParts = [`FREQ=${formData.recurrence_freq || 'WEEKLY'}`];
        if (formData.recurrence_until) {
          const untilDate = new Date(formData.recurrence_until);
          untilDate.setHours(23, 59, 59);
          const untilStr = untilDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
          ruleParts.push(`UNTIL=${untilStr}`);
        }
        if ((!formData.recurrence_freq || formData.recurrence_freq === 'WEEKLY') && formData.recurrence_byday?.length > 0) {
          ruleParts.push(`BYDAY=${formData.recurrence_byday.join(',')}`);
        }
        finalRule = ruleParts.join(';');
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        primaryCategory: formData.primaryCategory,
        customTags: formData.customTags,
        start_date: formData.start_date,
        end_date: formData.end_date,
        venue_name: formData.venue_name,
        event_address: formData.event_address,
        price: formData.price,
        ticket_url: formData.ticket_url,
        is_recurring: formData.is_recurring,
        recurrence_rule: finalRule,
        featuredImageId: featuredImageId ? parseInt(featuredImageId) : null,
      };

      const result = await updateEventMutation(initialData.databaseId, payload);
      
      if (result.success) {
        setUploadStep('complete');
        setShowSuccessModal(true);
      } else {
        alert(`Error: ${result.message}`);
        setUploadStep('idle');
      }
    } catch (error) {
      console.error(error);
      alert(`An error occurred: ${error.message}`);
      setUploadStep('idle');
    }
  };
  
  const isSubmitting = uploadStep !== 'idle';

  if (showSuccessModal) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#10b981', marginBottom: '1rem' }}>
          check_circle
        </span>
        <h2>Update Successful!</h2>
        <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Your event has been successfully updated.
        </p>
        <button 
          className="listing-primary-btn"
          style={{ padding: '0.75rem 2rem', border: 'none', cursor: 'pointer', borderRadius: '8px' }}
          onClick={() => router.push(locale === 'es' ? '/es/dashboard/events' : '/dashboard/events')}
        >
          Go to My Events
        </button>
      </div>
    );
  }

  const labelStyle = { fontWeight: "600", marginBottom: "0.5rem", display: "block" };
  const inputStyle = (hasError) => ({ padding: "0.75rem", borderRadius: "8px", border: `1px solid ${hasError ? '#e04c4c' : '#e2e8f0'}`, width: "100%", fontFamily: "inherit", boxSizing: "border-box" });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 0' }}>
      <ProgressOverlay step={uploadStep} />
      {isCropModalOpen && pendingCrop && (
        <ImageCropModal
          file={pendingCrop}
          onCancel={() => {
            setIsCropModalOpen(false);
            setPendingCrop(null);
          }}
          onSave={handleCropSave}
        />
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '2rem' }}>
        <SectionWrapper title="Basic Info">
          <div>
            <label htmlFor="title" style={labelStyle}>Event Title *</label>
            <input
              type="text"
              id="title"
              style={inputStyle(errors.title)}
              placeholder="E.g., Cape Coral Seafood Festival"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
            {errors.title && <span style={{ color: '#e04c4c', fontSize: '0.85rem' }}>{errors.title}</span>}
          </div>

          <div>
            <label htmlFor="primaryCategory" style={labelStyle}>Primary Category *</label>
            <select
              id="primaryCategory"
              style={inputStyle(errors.primaryCategory)}
              value={formData.primaryCategory}
              onChange={(e) => updateFormData({ primaryCategory: e.target.value })}
            >
              <option value="">-- Select a Category --</option>
              {EVENT_CATEGORIES.map(cat => (
                <option key={cat.slug} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
            {errors.primaryCategory && <span style={{ color: '#e04c4c', fontSize: '0.85rem' }}>{errors.primaryCategory}</span>}
          </div>

          <div>
            <label htmlFor="customTags" style={labelStyle}>Custom Tags (Optional, max 3)</label>
            <input
              type="text"
              id="customTags"
              style={inputStyle(errors.customTags)}
              placeholder="E.g., acoustic, outdoor"
              value={customTagsText}
              onChange={handleCustomTagsChange}
            />
            {errors.customTags && <span style={{ color: '#e04c4c', fontSize: '0.85rem' }}>{errors.customTags}</span>}
            <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>Separate tags with commas.</p>
          </div>

          <div>
            <label htmlFor="description" style={labelStyle}>Description *</label>
            <textarea
              id="description"
              style={inputStyle(errors.description)}
              placeholder="Tell us about the event..."
              rows="6"
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            ></textarea>
            {errors.description && <span style={{ color: '#e04c4c', fontSize: '0.85rem' }}>{errors.description}</span>}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Event Details">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label htmlFor="start_date" style={labelStyle}>Start Date/Time *</label>
              <input
                type="datetime-local"
                id="start_date"
                style={inputStyle(errors.start_date)}
                value={formData.start_date}
                onChange={(e) => updateFormData({ start_date: e.target.value })}
              />
              {errors.start_date && <span style={{ color: '#e04c4c', fontSize: '0.85rem' }}>{errors.start_date}</span>}
            </div>
            <div>
              <label htmlFor="end_date" style={labelStyle}>End Date/Time</label>
              <input
                type="datetime-local"
                id="end_date"
                style={inputStyle(false)}
                value={formData.end_date}
                onChange={(e) => updateFormData({ end_date: e.target.value })}
              />
            </div>
          </div>

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

          {formData.is_recurring && (
            <div style={{ backgroundColor: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={labelStyle}>Repeats</label>
                <select 
                  style={inputStyle(false)}
                  value={formData.recurrence_freq || 'WEEKLY'}
                  onChange={(e) => updateFormData({ recurrence_freq: e.target.value })}
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>

              {(!formData.recurrence_freq || formData.recurrence_freq === 'WEEKLY') && (
                <div>
                  <label style={labelStyle}>On these days</label>
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

              <div>
                <label style={labelStyle}>Ends on (Optional)</label>
                <input 
                  type="date"
                  style={inputStyle(false)}
                  value={formData.recurrence_until || ''}
                  onChange={(e) => updateFormData({ recurrence_until: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="venue_name" style={labelStyle}>Venue Name *</label>
            <input
              type="text"
              id="venue_name"
              style={inputStyle(errors.venue_name)}
              placeholder="E.g., Cape Coral Yacht Club"
              value={formData.venue_name}
              onChange={(e) => updateFormData({ venue_name: e.target.value })}
            />
            {errors.venue_name && <span style={{ color: '#e04c4c', fontSize: '0.85rem' }}>{errors.venue_name}</span>}
          </div>

          <div>
            <label htmlFor="event_address" style={labelStyle}>Street Address</label>
            {isLoaded ? (
              <Autocomplete 
                onLoad={onLoad} 
                onPlaceChanged={onPlaceChanged}
                options={{ fields: ["address_components", "geometry", "name", "formatted_address"] }}
              >
                <input
                  type="text"
                  id="event_address"
                  style={inputStyle(false)}
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
                style={inputStyle(false)}
                placeholder="Loading map..."
                disabled
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label htmlFor="price" style={labelStyle}>Price</label>
              <input
                type="text"
                id="price"
                style={inputStyle(false)}
                placeholder="E.g., $15 or Free"
                value={formData.price}
                onChange={(e) => updateFormData({ price: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="ticket_url" style={labelStyle}>Ticket URL</label>
              <input
                type="url"
                id="ticket_url"
                style={inputStyle(false)}
                placeholder="https://"
                value={formData.ticket_url}
                onChange={(e) => updateFormData({ ticket_url: e.target.value })}
              />
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper title="Event Media">
          <div>
            <label style={labelStyle}>Featured Image</label>
            
            {(!existingFeaturedImage && !newFeaturedImage) ? (
              <div style={{ border: '2px dashed #cbd5e1', padding: '2rem', textAlign: 'center', borderRadius: '8px' }}>
                <input
                  type="file"
                  id="featuredImage"
                  accept="image/jpeg, image/png, image/webp"
                  onChange={handleFileChange}
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
                  src={newFeaturedImage ? URL.createObjectURL(newFeaturedImage) : existingFeaturedImage?.sourceUrl}
                  alt="Preview"
                  fill
                  unoptimized
                  style={{ objectFit: "cover" }}
                />
                <button
                  type="button"
                  onClick={handleRemoveFeatured}
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
                </button>
              </div>
            )}
          </div>
        </SectionWrapper>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
          <button type="button" onClick={() => router.back()} disabled={isSubmitting} style={{ padding: "0.75rem 2rem", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", fontWeight: "600", cursor: "pointer" }}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="listing-primary-btn" style={{ padding: "0.75rem 2rem", border: "none", cursor: "pointer" }}>
            {isSubmitting ? "Processing..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
