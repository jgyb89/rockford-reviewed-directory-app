// src/components/auth/LoginModal.js
"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { useSearchParams } from 'next/navigation';
import { handleLogin, handleGoogleLogin } from "@/lib/actions";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import Link from "next/link";
import styles from "./LoginModal.module.css";

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

export default function LoginModal({ isOpen, onClose, dict = {}, locale = "en" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const activationStatus = searchParams ? searchParams.get('activation') : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const t = dict?.auth || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setError(null);

    const result = await handleLogin(username, password);

    if (result.success) {
      globalThis.location.reload(); 
      onClose();
    } else {
      setError(formatAuthError(result.error));
    }

    setIsUpdating(false);
  };

  const onGoogleSuccess = async (credentialResponse) => {
    setIsUpdating(true);
    setError(null);

    const result = await handleGoogleLogin(credentialResponse.credential);

    if (result.success) {
      globalThis.location.reload(); 
      // Note: the reload automatically closes the modal and updates the auth state
    } else {
      setError(formatAuthError(result.error));
      setIsUpdating(false);
    }
  };

  return createPortal(
    <div className={styles['login-modal-overlay']}>
      <button
        className={styles['login-modal-overlay__btn']}
        onClick={onClose}
        aria-label="Close modal"
        type="button"
      />
      <dialog 
        className={styles['login-modal']} 
        open
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <button
          className={styles['login-modal__close']}
          onClick={onClose}
          aria-label="Close modal"
          type="button"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h2 id="login-modal-title" className={styles['login-modal__title']}>
          {t.modalTitle || "Make a free account!"}
        </h2>
        <p className={styles['login-modal__subtitle']}>
          {t.modalSubtitle || "Sign up for free in order to share, favorite, or leave reviews! This ensures we keep the site spam-free and a better experience for everyone!"}
        </p>

        {error && (
          <div className={styles['login-modal__error']}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>warning</span>
            <span>{error}</span>
          </div>
        )}

        {activationStatus === 'success' && (
          <div style={{ 
            backgroundColor: '#dcfce7', color: '#065f46', border: '1px solid #10b981',
            padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', 
            textAlign: 'center', fontWeight: '500', fontSize: '0.9rem'
          }}>
            Account successfully activated! Please log in to continue.
          </div>
        )}

        {activationStatus === 'invalid' && (
          <div style={{ 
            backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #ef4444',
            padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', 
            textAlign: 'center', fontWeight: '500', fontSize: '0.9rem'
          }}>
            This activation link is invalid or has already been used. If you already activated your account, you can log in below.
          </div>
        )}

        <form className={styles['login-modal__form']} onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => setError('Google Login Failed')}
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

          <div className={styles['login-modal__form-group']}>
            <label className={styles['login-modal__label']} htmlFor="modal-username">
              {t.usernameEmail || "Username or Email"}
            </label>
            <input
              id="modal-username"
              type="text"
              className={styles['login-modal__input']}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className={styles['login-modal__form-group']}>
            <label className={styles['login-modal__label']} htmlFor="modal-password">
              {t.password || "Password"}
            </label>
            <input
              id="modal-password"
              type="password"
              className={styles['login-modal__input']}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className={styles['login-modal__options']}>
            <label className={styles['login-modal__remember']}>
              <input type="checkbox" /> {t.rememberMe || "Remember Me"}
            </label>
            <Link href={`/login?recover=true`} className={styles['login-modal__forgot']}>
              {t.recoverPassword || "Recover Password"}
            </Link>
          </div>

          <button
            type="submit"
            className={styles['login-modal__submit']}
            disabled={isUpdating}
          >
            {isUpdating ? "..." : (t.logIn || "Log In")}
          </button>
        </form>

        <div className={styles['login-modal__footer']}>
          {t.noAccount || "Don't have an account?"}{" "}
          <Link
            href={`/register`}
            className={styles['login-modal__signup-link']}
            onClick={onClose}
          >
            {t.signUp || "Sign Up"}
          </Link>
        </div>
      </dialog>
    </div>,
    document.body
  );
}

LoginModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  dict: PropTypes.object,
  locale: PropTypes.string,
};
