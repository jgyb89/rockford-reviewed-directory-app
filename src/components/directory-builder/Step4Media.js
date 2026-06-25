"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import styles from "./StepForm.module.css";
import wizardStyles from "./ListingWizard.module.css";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/jpg"]);

function validateFiles(files) {
  const errors = [];
  const valid = files.filter((file) => {
    if (!ALLOWED_TYPES.has(file.type)) {
      errors.push(
        `"${file.name}" is not a valid format (JPEG, PNG, WEBP only).`,
      );
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`"${file.name}" exceeds the 5MB limit.`);
      return false;
    }
    return true;
  });
  return { valid, errors };
}

function FeaturedImageSection({
  formData,
  fileErrors,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemove,
}) {
  let featuredBorderColor = "#cbd5e1";
  if (fileErrors.featured) {
    featuredBorderColor = "#ef4444";
  } else if (dragState.featured) {
    featuredBorderColor = "#e04c4c";
  }

  return (
    <div className={styles["step-form__group"]}>
      <div className={styles["step-form__label"]}>Featured Image</div>

      {formData.featuredImage ? (
        <div
          style={{
            position: "relative",
            width: "200px",
            height: "140px",
            borderRadius: "8px",
            overflow: "hidden",
            border: "1px solid #e2e8f0",
          }}
        >
          <Image
            src={URL.createObjectURL(formData.featuredImage)}
            alt="Featured Preview"
            fill
            unoptimized
            style={{ objectFit: "cover" }}
          />
          <button
            onClick={onRemove}
            title="Remove image"
            style={{
              position: "absolute",
              top: "0.5rem",
              right: "0.5rem",
              background: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1rem" }}
            >
              close
            </span>
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => onDragOver(e, "featured")}
          onDragLeave={(e) => onDragLeave(e, "featured")}
          onDrop={(e) => onDrop(e, "featured")}
          style={{
            border: `2px dashed ${featuredBorderColor}`,
            backgroundColor: dragState.featured ? "#fef2f2" : "#f8fafc",
            padding: "3rem 2rem",
            borderRadius: "12px",
            textAlign: "center",
            transition: "all 0.2s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "2.5rem",
              color: "#94a3b8",
            }}
          >
            add_photo_alternate
          </span>
          <p style={{ margin: 0, color: "#475569" }}>
            Drag & drop your featured image here, or
          </p>
          <input
            type="file"
            id="featuredImage"
            accept="image/jpeg, image/png, image/webp"
            onChange={(e) => onFileChange(e, "featuredImage")}
            style={{ display: "none" }}
          />
          <label
            htmlFor="featuredImage"
            style={{
              cursor: "pointer",
              backgroundColor: "#fff",
              border: "1px solid #cbd5e1",
              padding: "0.5rem 1.25rem",
              borderRadius: "6px",
              color: "#1e293b",
              fontWeight: 600,
              display: "inline-block",
              fontSize: "0.9rem",
            }}
          >
            Browse Files
          </label>
        </div>
      )}

      {fileErrors.featured && (
        <div
          style={{
            color: "#ef4444",
            fontSize: "0.9rem",
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            fontWeight: 500,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.1rem" }}
          >
            error
          </span>
          {fileErrors.featured}
        </div>
      )}
    </div>
  );
}

function GallerySection({
  formData,
  fileErrors,
  dragState,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemove,
}) {
  let galleryBorderColor = "#cbd5e1";
  if (fileErrors.gallery) {
    galleryBorderColor = "#ef4444";
  } else if (dragState.gallery) {
    galleryBorderColor = "#e04c4c";
  }

  return (
    <div className={styles["step-form__group"]}>
      <div className={styles["step-form__label"]}>
        Gallery Images (Max 10)
      </div>

      <div
        onDragOver={(e) => onDragOver(e, "gallery")}
        onDragLeave={(e) => onDragLeave(e, "gallery")}
        onDrop={(e) => onDrop(e, "gallery")}
        style={{
          border: `2px dashed ${galleryBorderColor}`,
          backgroundColor: dragState.gallery ? "#fef2f2" : "#f8fafc",
          padding: "2rem",
          borderRadius: "12px",
          transition: "all 0.2s ease",
          minHeight: "150px",
        }}
      >
        {formData.gallery && formData.gallery.length > 0 ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {formData.gallery.map((file, index) => (
              <div
                key={file.name ? `${file.name}-${index}` : index}
                style={{
                  position: "relative",
                  width: "100px",
                  height: "100px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#fff",
                }}
              >
                <Image
                  src={URL.createObjectURL(file)}
                  alt={`Gallery preview ${index + 1}`}
                  fill
                  unoptimized
                  style={{
                    objectFit: "cover",
                  }}
                />
                <button
                  onClick={() => onRemove(index)}
                  title="Remove image"
                  style={{
                    position: "absolute",
                    top: "0.25rem",
                    right: "0.25rem",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "22px",
                    height: "22px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "0.9rem" }}
                  >
                    close
                  </span>
                </button>
              </div>
            ))}

            {formData.gallery.length < 10 && (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <input
                  type="file"
                  id="gallery"
                  accept="image/jpeg, image/png, image/webp"
                  multiple
                  onChange={(e) => onFileChange(e, "gallery")}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="gallery"
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    color: "#64748b",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.5rem" }}
                  >
                    add
                  </span>
                  <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    Add More
                  </span>
                </label>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "1rem 0",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: "2.5rem",
                color: "#94a3b8",
              }}
            >
              collections
            </span>
            <p style={{ margin: 0, color: "#475569" }}>
              Drag & drop your gallery images here
            </p>
            <input
              type="file"
              id="gallery"
              accept="image/jpeg, image/png, image/webp"
              multiple
              onChange={(e) => onFileChange(e, "gallery")}
              style={{ display: "none" }}
            />
            <label
              htmlFor="gallery"
              style={{
                cursor: "pointer",
                backgroundColor: "#fff",
                border: "1px solid #cbd5e1",
                padding: "0.5rem 1.25rem",
                borderRadius: "6px",
                color: "#1e293b",
                fontWeight: 600,
                display: "inline-block",
                fontSize: "0.9rem",
              }}
            >
              Browse Files
            </label>
          </div>
        )}
      </div>

      {fileErrors.gallery && (
        <div
          style={{
            color: "#ef4444",
            fontSize: "0.9rem",
            marginTop: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            fontWeight: 500,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "1.1rem" }}
          >
            error
          </span>
          {fileErrors.gallery}
        </div>
      )}
    </div>
  );
}

function Step4Media({ formData, updateFormData, nextStep, prevStep }) {
  const [errors, setErrors] = useState({});
  const [fileErrors, setFileErrors] = useState({ featured: "", gallery: "" });
  const [dragState, setDragState] = useState({
    featured: false,
    gallery: false,
  });

  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleFeaturedProcess = (validFiles, currentErrors) => {
    if (currentErrors.length > 0) {
      setFileErrors((prev) => ({ ...prev, featured: currentErrors[0] }));
    } else if (validFiles.length > 0) {
      setFileErrors((prev) => ({ ...prev, featured: "" }));
      updateFormData({ featuredImage: validFiles[0] });
    }
  };

  const handleGalleryProcess = (validFiles, currentErrors) => {
    let newGallery = [...(formData.gallery || []), ...validFiles];
    let galleryErrors = [...currentErrors];
    if (newGallery.length > 10) {
      galleryErrors.push("Maximum 10 images allowed. Excess images were removed.");
      newGallery = newGallery.slice(0, 10);
    }

    setFileErrors((prev) => ({
      ...prev,
      gallery: galleryErrors.length > 0 ? galleryErrors.join(" ") : "",
    }));

    if (validFiles.length > 0 || galleryErrors.length > 0) {
      updateFormData({ gallery: newGallery });
    }
  };

  const processFiles = (incomingFiles, field) => {
    const { valid: validFiles, errors: currentErrors } = validateFiles(incomingFiles);

    if (field === "featuredImage") {
      handleFeaturedProcess(validFiles, currentErrors);
    } else if (field === "gallery") {
      handleGalleryProcess(validFiles, currentErrors);
    }
  };

  const handleFileChange = (e, field) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files), field);
    }
    e.target.value = null;
  };

  const handleDragOver = (e, field) => {
    e.preventDefault();
    setDragState((prev) => ({ ...prev, [field]: true }));
  };

  const handleDragLeave = (e, field) => {
    e.preventDefault();
    setDragState((prev) => ({ ...prev, [field]: false }));
  };

  const handleDrop = (e, field) => {
    e.preventDefault();
    setDragState((prev) => ({ ...prev, [field]: false }));

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const targetField = field === "featured" ? "featuredImage" : field;
      processFiles(Array.from(e.dataTransfer.files), targetField);
    }
  };

  const removeFeatured = () => {
    updateFormData({ featuredImage: null });
    setFileErrors((prev) => ({ ...prev, featured: "" }));
  };

  const removeGalleryImage = (indexToRemove) => {
    const newGallery = formData.gallery.filter(
      (_, index) => index !== indexToRemove,
    );
    updateFormData({ gallery: newGallery });
    setFileErrors((prev) => ({ ...prev, gallery: "" }));
  };

  const handleNext = () => {
    const newErrors = {};
    if (formData.videoUrl && !isValidUrl(formData.videoUrl)) {
      newErrors.videoUrl = "Must start with http:// or https://";
    }

    if (fileErrors.featured || fileErrors.gallery) {
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      nextStep();
    }
  };

  return (
    <div className={styles["step-form"]}>
      <header className={styles["step-form__header"]}>
        <span className="material-symbols-outlined">perm_media</span>
        <h2>Media & Gallery</h2>
      </header>

      <FeaturedImageSection
        formData={formData}
        fileErrors={fileErrors}
        dragState={dragState}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileChange={handleFileChange}
        onRemove={removeFeatured}
      />

      <GallerySection
        formData={formData}
        fileErrors={fileErrors}
        dragState={dragState}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onFileChange={handleFileChange}
        onRemove={removeGalleryImage}
      />

      <div className={styles["step-form__group"]}>
        <label htmlFor="videoUrl" className={styles["step-form__label"]}>
          Video URL (YouTube/Vimeo)
        </label>
        <input
          type="url"
          id="videoUrl"
          className={`${styles["step-form__input"]} ${errors.videoUrl ? styles["step-form__input--error"] : ""}`}
          placeholder="https://www.youtube.com/watch?v=..."
          value={formData.videoUrl}
          onChange={(e) => updateFormData({ videoUrl: e.target.value })}
        />
        {errors.videoUrl && (
          <span
            className={styles["step-form__error-message"]}
            style={{
              color: "#ef4444",
              fontSize: "0.9rem",
              marginTop: "0.25rem",
              display: "block",
            }}
          >
            {errors.videoUrl}
          </span>
        )}
      </div>

      <div className={wizardStyles["wizard__actions"]}>
        <button
          className={`${wizardStyles["wizard__button"]} ${wizardStyles["wizard__button--secondary"]}`}
          onClick={prevStep}
        >
          Back
        </button>
        <button
          className={`${wizardStyles["wizard__button"]} ${wizardStyles["wizard__button--primary"]}`}
          onClick={handleNext}
          disabled={!!fileErrors.featured || !!fileErrors.gallery}
          style={{
            opacity: fileErrors.featured || fileErrors.gallery ? 0.5 : 1,
            cursor:
              fileErrors.featured || fileErrors.gallery
                ? "not-allowed"
                : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}

FeaturedImageSection.propTypes = {
  formData: PropTypes.shape({
    featuredImage: PropTypes.any,
  }).isRequired,
  fileErrors: PropTypes.shape({
    featured: PropTypes.string,
  }).isRequired,
  dragState: PropTypes.shape({
    featured: PropTypes.bool,
  }).isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

GallerySection.propTypes = {
  formData: PropTypes.shape({
    gallery: PropTypes.arrayOf(PropTypes.any),
  }).isRequired,
  fileErrors: PropTypes.shape({
    gallery: PropTypes.string,
  }).isRequired,
  dragState: PropTypes.shape({
    gallery: PropTypes.bool,
  }).isRequired,
  onDragOver: PropTypes.func.isRequired,
  onDragLeave: PropTypes.func.isRequired,
  onDrop: PropTypes.func.isRequired,
  onFileChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

Step4Media.propTypes = {
  formData: PropTypes.shape({
    featuredImage: PropTypes.any,
    gallery: PropTypes.arrayOf(PropTypes.any),
    videoUrl: PropTypes.string,
  }).isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default Step4Media;
