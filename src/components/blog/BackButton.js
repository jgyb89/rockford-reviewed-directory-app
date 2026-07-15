"use client";

import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

export default function BackButton({ label = "Go Back", fallback = "/directory" }) {
  const router = useRouter();

  const handleBack = () => {
    const initialLength = parseInt(sessionStorage.getItem('ccr_initial_history_length') || '0', 10);
    if (window.history.length > initialLength) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  return (
    <div className="blog-post__back-wrapper">
      <button onClick={handleBack} className="listing-action-btn">
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="listing-action-btn__text">{label}</span>
      </button>
    </div>
  );
}

BackButton.propTypes = {
  label: PropTypes.string,
  fallback: PropTypes.string,
};
