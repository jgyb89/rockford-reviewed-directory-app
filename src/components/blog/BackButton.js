"use client";

import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

export default function BackButton({ label = "Go Back" }) {
  const router = useRouter();

  return (
    <div className="blog-post__back-wrapper">
      <button onClick={() => router.back()} className="listing-action-btn">
        <span className="material-symbols-outlined">arrow_back</span>
        <span className="listing-action-btn__text">{label}</span>
      </button>
    </div>
  );
}

BackButton.propTypes = {
  label: PropTypes.string,
};
