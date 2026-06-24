// src/components/auth/RegisterForm.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { formatPhoneNumber } from "@/lib/formatUtils";
import styles from '../RegisterBusinessForm.module.css';

export default function RegisterForm({ dict = {}, locale = "en" }) {
  const t = dict?.register || {};
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    consent: false,
  });
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(""); // "", "weak", "medium", "strong"
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

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
    let error = "";
    if (name === "username") {
      if (!value) error = "Username is required";
      else if (value.length < 3) error = "Username must be at least 3 characters";
    } else if (name === "email") {
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (!value) error = "Email is required";
      else if (!emailRegex.test(value)) error = "Please enter a valid email address";
    } else if (name === "password") {
      if (!value) error = "Password is required";
      else if (checkPasswordStrength(value) === "weak") error = "Password is too weak";
    } else if (name === "consent") {
      if (!value) error = "You must agree to the Terms and Conditions";
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "phoneNumber") {
      finalValue = formatPhoneNumber(finalValue);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Real-time validation
    const error = validateField(name, finalValue);
    setFieldErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(finalValue));
    }
  };

  const isFormValid = () => {
    const requiredFields = ["username", "email", "password", "consent"];
    const hasRequired = requiredFields.every((field) => formData[field]);
    const hasNoErrors = Object.values(fieldErrors).every((err) => !err);
    const isMediumStrength = passwordStrength === "medium" || passwordStrength === "strong";
    
    return hasRequired && hasNoErrors && isMediumStrength;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) return;

    setIsLoading(true);
    setGeneralError(null);

    const GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

    const fieldValues = [
      { id: 15, value: formData.firstName },
      { id: 16, value: formData.lastName },
      { id: 3, value: formData.username },
      { id: 13, value: formData.phoneNumber },
      { id: 2, emailValues: { value: formData.email } },
      { id: 4, value: formData.password },
      { id: 17, value: "1" },
    ];

    const mutation = `
      mutation SubmitRegistrationForm($input: SubmitGfFormInput!) {
        submitGfForm(input: $input) {
          errors { 
            message 
          }
          confirmation {
            message
          }
        }
      }
    `;

    try {
      const res = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "User-Agent": "CCR-NextJS-Frontend/1.0"
        },
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              id: "1",
              fieldValues,
            }
          },
        }),
      });

      const json = await res.json();
      const gfResponse = json.data?.submitGfForm;

      if (gfResponse?.errors && gfResponse.errors.length > 0) {
        setGeneralError(gfResponse.errors[0].message || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      router.push(`/check-email`);
    } catch (err) {
      setGeneralError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles['register-form']} onSubmit={handleSubmit}>
      <div className={styles['register-form__group']}>
        <label className={styles['register-form__label']} htmlFor="username">{t.username || "Username"}</label>
        <input
          id="username"
          name="username"
          type="text"
          className={`${styles['register-form__input']} ${fieldErrors.username ? styles['register-form__input--invalid'] : ""}`}
          value={formData.username}
          onChange={handleChange}
          required
        />
        {fieldErrors.username && <span className={styles['register-form__error-text']}>{fieldErrors.username}</span>}
      </div>

      <div className={styles['register-form__group']}>
        <label className={styles['register-form__label']} htmlFor="email">{t.email || "Email"}</label>
        <input
          id="email"
          name="email"
          type="email"
          className={`${styles['register-form__input']} ${fieldErrors.email ? styles['register-form__input--invalid'] : ""}`}
          value={formData.email}
          onChange={handleChange}
          required
        />
        {fieldErrors.email && <span className={styles['register-form__error-text']}>{fieldErrors.email}</span>}
      </div>

      <div className={styles['register-form__group']}>
        <label className={styles['register-form__label']} htmlFor="password">{t.password || "Password"}</label>
        <div className={styles['register-form__password-wrapper']}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className={`${styles['register-form__input']} ${fieldErrors.password ? styles['register-form__input--invalid'] : ""}`}
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button 
            type="button" 
            className={styles['register-form__toggle-icon']} 
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{ background: 'none', border: 'none', padding: 0 }}
          >
            <span className="material-symbols-outlined">
              {showPassword ? 'visibility_off' : 'visibility'}
            </span>
          </button>
        </div>
        {passwordStrength && (
          <>
            <div className={styles['register-form__strength-meter']} data-strength={passwordStrength}>
              <div className={styles['register-form__strength-bar']}></div>
              <div className={styles['register-form__strength-bar']}></div>
              <div className={styles['register-form__strength-bar']}></div>
            </div>
            <span className={styles['register-form__strength-text']}>
              Strength: {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
            </span>
          </>
        )}
        {fieldErrors.password && <span className={styles['register-form__error-text']}>{fieldErrors.password}</span>}
      </div>

      <div className={styles['register-form__row']}>
        <div className={styles['register-form__group']}>
          <label className={styles['register-form__label']} htmlFor="firstName">{t.firstName || "First Name"}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            className={styles['register-form__input']}
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        <div className={styles['register-form__group']}>
          <label className={styles['register-form__label']} htmlFor="lastName">{t.lastName || "Last Name"}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            className={styles['register-form__input']}
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className={styles['register-form__group']}>
        <label className={styles['register-form__label']} htmlFor="phoneNumber">{t.phone || "Phone Number"}</label>
        <input
          id="phoneNumber"
          name="phoneNumber"
          type="tel"
          className={styles['register-form__input']}
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="(XXX) XXX-XXXX"
        />
      </div>

      <div className={styles['register-form__checkbox-group']}>
        <input
          id="consent"
          name="consent"
          type="checkbox"
          className={styles['register-form__checkbox']}
          checked={formData.consent}
          onChange={handleChange}
          required
        />
        <label htmlFor="consent" style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>
          I agree to the{' '}
          <a 
            href={`/terms-of-service`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#e04c4c', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: '500' }}
          >
            Terms of Service
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
          </a>
          {' '}and{' '}
          <a 
            href={`/privacy-policy`} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ color: '#e04c4c', textDecoration: 'underline', display: 'inline-flex', alignItems: 'center', gap: '2px', fontWeight: '500' }}
          >
            Privacy Policy
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>open_in_new</span>
          </a>.
        </label>
      </div>
      {fieldErrors.consent && <span className={styles['register-form__error-text']} style={{ marginBottom: '1.5rem', display: 'block' }}>{fieldErrors.consent}</span>}

      {generalError && <p className={styles['register-form__error']}>{generalError}</p>}

      <button
        type="submit"
        className={styles['register-form__submit']}
        disabled={isLoading || !isFormValid()}
      >
        {isLoading ? "..." : (t.button || "Create Account")}
      </button>
    </form>
  );
}

RegisterForm.propTypes = {
  dict: PropTypes.object,
  locale: PropTypes.string,
};
