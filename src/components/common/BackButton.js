'use client';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';

export default function BackButton({ fallback = "/directory" }) {
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
    <button
      onClick={handleBack}
      type="button"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '1rem',
        padding: 0,
        transition: 'color 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = '#e57007'}
      onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
      onFocus={(e) => e.currentTarget.style.color = '#e57007'}
      onBlur={(e) => e.currentTarget.style.color = '#64748b'}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_back</span>
      Back
    </button>
  );
}

BackButton.propTypes = {
  fallback: PropTypes.string,
};
