"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { registerBusiness } from "@/lib/actions";
import { formatPhoneNumber } from "@/lib/formatUtils";
import styles from "./RegisterBusinessForm.module.css";

export default function RegisterBusinessForm({ locale = "en" }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    businessName: "",
    email: "",
    password: "",
    phone: "",
    website: "",
    consent: false,
    top3Spots: false,
    generateLeads: false,
    facelift: false,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(""); // "", "weak", "medium", "strong"
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Password strength logic
  const checkPasswordStrength = (password) => {
    if (!password) return "";
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) strength++;

    if (strength === 1) return "weak";
    if (strength === 2) return "medium";
    if (strength === 3) return "strong";
    return "weak";
  };

  const validateField = (name, value) => {
    const validations = {
      firstName: (v) => (v ? "" : "First name is required"),
      lastName: (v) => (v ? "" : "Last name is required"),
      businessName: (v) => (v ? "" : "Business name is required"),
      email: (v) => {
        if (!v) return "Email is required";
        // Safe email regex: avoiding nested quantifiers that cause ReDoS
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(v) ? "" : "Please enter a valid email address";
      },
      website: (v) => {
        if (!v) return "";
        try {
          const url = new URL(v.startsWith('http') ? v : `https://${v}`);
          return (url.protocol === "http:" || url.protocol === "https:") ? "" : "Please enter a valid URL";
        } catch (e) {
          console.debug("Invalid URL:", e);
          return "Please enter a valid URL";
        }
      },
      password: (v) => {
        if (!v) return "Password is required";
        return checkPasswordStrength(v) === "weak"
          ? "Password is too weak"
          : "";
      },
      phone: (v) => {
        if (!v) return "Phone number is required";
        return v.length < 14 ? "Please enter a valid phone number" : "";
      },
      consent: (v) => (v ? "" : "You must agree to the Terms of Services and Privacy Policy"),
    };

    return validations[name] ? validations[name](value) : "";
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "phone") {
      finalValue = formatPhoneNumber(finalValue);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Real-time validation
    const errorMsg = validateField(name, finalValue);
    setFieldErrors((prev) => ({ ...prev, [name]: errorMsg }));

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(finalValue));
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      "firstName",
      "lastName",
      "businessName",
      "email",
      "password",
      "phone",
      "consent",
    ];
    const hasRequired = requiredFields.every((field) => formData[field]);
    const hasNoErrors = Object.values(fieldErrors).every((err) => !err);
    const isMediumStrength =
      passwordStrength === "medium" || passwordStrength === "strong";

    return hasRequired && hasNoErrors && isMediumStrength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsSubmitting(true);
    setError("");

    // Map basic fields and ensure IDs are strict integers
    const fieldValues = [
      { id: 15, value: formData.firstName },
      { id: 16, value: formData.lastName },
      { id: 3, value: formData.businessName },
      { id: 13, value: formData.phone },
      { id: 20, value: formData.website },
    ].map((field) => ({
      id: Number.parseInt(field.id, 10),
      value: field.value,
    }));

    // Fix Email Field (ID 2) to use emailValues as required by GraphQL schema
    // Field 4 is the Password field.
    fieldValues.push(
      {
        id: 2,
        emailValues: { value: formData.email },
      },
      {
        id: 4,
        value: formData.password,
      }
    );

    // Field 17 is the Consent checkbox. WPGraphQL expects a single 'value' string.
    // Gravity Forms uses "1" to mark a consent field as checked.
    if (formData.consent) {
      fieldValues.push({ id: 17, value: "1" });
    }

    // Field 19 contains the Marketing interest checkboxes.
    // WPGraphQL expects an array of objects under the 'checkboxValues' key.
    const marketingValues = [];

    if (formData.top3Spots) {
      marketingValues.push({
        inputId: 19.1,
        value: "Do you want to be in the top 3 spots on Google Maps?",
      });
    }
    if (formData.generateLeads) {
      marketingValues.push({
        inputId: 19.2,
        value: "Does your website generate leads for you?",
      });
    }
    if (formData.facelift) {
      marketingValues.push({
        inputId: 19.3,
        value: "Could your website use a facelift?",
      });
    }

    // Only push the field if at least one checkbox was selected
    if (marketingValues.length > 0) {
      fieldValues.push({ id: 19, checkboxValues: marketingValues });
    }

    try {
      const result = await registerBusiness(fieldValues);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      setError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={styles["register-success"]}>
        <h2 className={styles["register-success__title"]}>Success!</h2>
        <p className={styles["register-success__message"]}>
          Please check your email to activate your account.
        </p>
      </div>
    );
  }

  return (
    <form className={styles["register-form"]} onSubmit={handleSubmit}>
      <div className={styles["register-form__row"]}>
        <div className={styles["register-form__group"]}>
          <label htmlFor="firstName" className={styles["register-form__label"]}>
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            className={`${styles["register-form__input"]} ${fieldErrors.firstName ? styles["register-form__input--invalid"] : ""}`}
            required
            value={formData.firstName}
            onChange={handleChange}
          />
          {fieldErrors.firstName && (
            <span className={styles["register-form__error-text"]}>
              {fieldErrors.firstName}
            </span>
          )}
        </div>
        <div className={styles["register-form__group"]}>
          <label htmlFor="lastName" className={styles["register-form__label"]}>
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            className={`${styles["register-form__input"]} ${fieldErrors.lastName ? styles["register-form__input--invalid"] : ""}`}
            required
            value={formData.lastName}
            onChange={handleChange}
          />
          {fieldErrors.lastName && (
            <span className={styles["register-form__error-text"]}>
              {fieldErrors.lastName}
            </span>
          )}
        </div>
      </div>

      <div className={styles["register-form__group"]}>
        <label
          htmlFor="businessName"
          className={styles["register-form__label"]}
        >
          Business Name
        </label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          className={`${styles["register-form__input"]} ${fieldErrors.businessName ? styles["register-form__input--invalid"] : ""}`}
          required
          value={formData.businessName}
          onChange={handleChange}
        />
        {fieldErrors.businessName && (
          <span className={styles["register-form__error-text"]}>
            {fieldErrors.businessName}
          </span>
        )}
      </div>

      <div className={styles["register-form__group"]}>
        <label htmlFor="email" className={styles["register-form__label"]}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`${styles["register-form__input"]} ${fieldErrors.email ? styles["register-form__input--invalid"] : ""}`}
          required
          value={formData.email}
          onChange={handleChange}
        />
        {fieldErrors.email && (
          <span className={styles["register-form__error-text"]}>
            {fieldErrors.email}
          </span>
        )}
      </div>

      <div className={styles["register-form__group"]}>
        <label htmlFor="password" className={styles["register-form__label"]}>
          Password
        </label>
        <div className={styles["register-form__password-wrapper"]}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className={`${styles["register-form__input"]} ${fieldErrors.password ? styles["register-form__input--invalid"] : ""}`}
            required
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className={styles["register-form__toggle-icon"]}
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ background: "none", border: "none", padding: 0 }}
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        {passwordStrength && (
          <>
            <div
              className={styles["register-form__strength-meter"]}
              data-strength={passwordStrength}
            >
              <div className={styles["register-form__strength-bar"]}></div>
              <div className={styles["register-form__strength-bar"]}></div>
              <div className={styles["register-form__strength-bar"]}></div>
            </div>
            <span className={styles["register-form__strength-text"]}>
              Strength:{" "}
              {passwordStrength.charAt(0).toUpperCase() +
                passwordStrength.slice(1)}
            </span>
          </>
        )}
        {fieldErrors.password && (
          <span className={styles["register-form__error-text"]}>
            {fieldErrors.password}
          </span>
        )}
      </div>

      <div className={styles["register-form__group"]}>
        <label htmlFor="phone" className={styles["register-form__label"]}>
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className={`${styles["register-form__input"]} ${fieldErrors.phone ? styles["register-form__input--invalid"] : ""}`}
          required
          value={formData.phone}
          onChange={handleChange}
          placeholder="(XXX) XXX-XXXX"
        />
        {fieldErrors.phone && (
          <span className={styles["register-form__error-text"]}>
            {fieldErrors.phone}
          </span>
        )}
      </div>

      <div className={styles["register-form__group"]}>
        <label htmlFor="website" className={styles["register-form__label"]}>
          Website URL
        </label>
        <input
          id="website"
          name="website"
          type="url"
          className={`${styles["register-form__input"]} ${fieldErrors.website ? styles["register-form__input--invalid"] : ""}`}
          value={formData.website}
          onChange={handleChange}
          placeholder="https://example.com"
        />
        {fieldErrors.website && (
          <span className={styles["register-form__error-text"]}>
            {fieldErrors.website}
          </span>
        )}
      </div>

      <div className={styles["register-form__checkbox-section"]}>
        <div className={styles["register-form__checkbox-group"]}>
          <input
            id="consent"
            name="consent"
            type="checkbox"
            className={styles["register-form__checkbox"]}
            required
            checked={formData.consent}
            onChange={handleChange}
          />
          <label htmlFor="consent" style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
            {"I agree to the "}
            <a 
              href={`/terms-of-service`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#e04c4c', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: '500' }}
            >
              Terms of Service{" "}
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
            </a>
            {" and "}
            <a 
              href={`/privacy-policy`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: '#e04c4c', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: '500' }}
            >
              Privacy Policy{" "}
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
            </a>.
          </label>
        </div>
        {fieldErrors.consent && (
          <span
            className={styles["register-form__error-text"]}
            style={{ marginBottom: "1.5rem", display: "block" }}
          >
            {fieldErrors.consent}
          </span>
        )}

        <p className={styles["register-form__marketing-hint"]}>
          Are you interested in any of these services?
        </p>

        <div className={styles["register-form__checkbox-group"]}>
          <input
            id="top3Spots"
            name="top3Spots"
            type="checkbox"
            className={styles["register-form__checkbox"]}
            checked={formData.top3Spots}
            onChange={handleChange}
          />
          <label
            htmlFor="top3Spots"
            className={styles["register-form__checkbox-label"]}
          >
            Claim one of the Top 3 Spots in your category
          </label>
        </div>

        <div className={styles["register-form__checkbox-group"]}>
          <input
            id="generateLeads"
            name="generateLeads"
            type="checkbox"
            className={styles["register-form__checkbox"]}
            checked={formData.generateLeads}
            onChange={handleChange}
          />
          <label
            htmlFor="generateLeads"
            className={styles["register-form__checkbox-label"]}
          >
            Generate more leads
          </label>
        </div>

        <div className={styles["register-form__checkbox-group"]}>
          <input
            id="facelift"
            name="facelift"
            type="checkbox"
            className={styles["register-form__checkbox"]}
            checked={formData.facelift}
            onChange={handleChange}
          />
          <label
            htmlFor="facelift"
            className={styles["register-form__checkbox-label"]}
          >
            Website or Brand Facelift
          </label>
        </div>
      </div>

      {error && <p className={styles["register-form__error"]}>{error}</p>}

      <button
        type="submit"
        className={styles["register-form__submit"]}
        disabled={isSubmitting || !isFormValid()}
      >
        {isSubmitting ? "Submitting..." : "Register Business"}
      </button>
    </form>
  );
}

RegisterBusinessForm.propTypes = {
  locale: PropTypes.string,
};
