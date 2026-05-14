// src/components/auth/LoginForm.js
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { handleLogin, handleGoogleLogin } from '@/lib/actions';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import styles from './Auth.module.css';

const formatAuthError = (errorString) => {
  if (!errorString) return "An error occurred during login. Please verify your credentials and try again.";
  const err = errorString.toLowerCase();
  if (err.includes("invalid_username") || err.includes("invalid_email")) {
    return "We couldn't find an account with that username or email.";
  }
  if (err.includes("incorrect_password")) {
    return "The password you entered is incorrect. Please try again.";
  }
  return "An error occurred during login. Please verify your credentials and try again.";
};

export default function LoginForm() {
  const params = useParams();
  const locale = params?.locale || 'en';
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const result = await handleLogin(formData.username, formData.password);

    if (result.success) {
      globalThis.location.href = `/dashboard`;
    } else {
      setError(formatAuthError(result.error));
      setIsLoading(false);
    }
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError(null);
    const result = await handleGoogleLogin(credentialResponse.credential);
    if (result.success) {
      globalThis.location.href = `/dashboard`;
    } else {
      setError(formatAuthError(result.error));
      setIsLoading(false);
    }
  };

  return (
    <form className={styles['auth-form']} onSubmit={handleSubmit}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
        <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={onGoogleSuccess}
            onError={() => setError(formatAuthError('Google Login Failed'))}
            useOneTap
            shape="rectangular"
            size="large"
            theme="outline"
            width="100%"
          />
        </GoogleOAuthProvider>
      </div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#94a3b8', fontSize: '0.9rem', position: 'relative' }}>
        <span style={{ background: '#fff', padding: '0 10px', position: 'relative', zIndex: 1 }}>or sign in with email</span>
        <hr style={{ position: 'absolute', top: '50%', left: 0, right: 0, border: 'none', borderTop: '1px solid #e2e8f0', margin: 0, zIndex: 0 }} />
      </div>

      <div className={styles['auth-form__group']}>
        <label className={styles['auth-form__label']} htmlFor="username">Username or Email</label>
        <input
          id="username"
          name="username"
          type="text"
          className={styles['auth-form__input']}
          value={formData.username}
          onChange={handleChange}
          required
          autoComplete="username"
        />
      </div>

      <div className={styles['auth-form__group']}>
        <label className={styles['auth-form__label']} htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          className={styles['auth-form__input']}
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className={styles['auth-form__error']}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>warning</span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className={styles['auth-form__submit']}
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
