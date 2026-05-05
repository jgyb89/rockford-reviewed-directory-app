'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
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
        marginBottom: '2rem',
        padding: 0,
        transition: 'color 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.color = '#e04c4c'}
      onMouseOut={(e) => e.currentTarget.style.color = '#64748b'}
      onFocus={(e) => e.currentTarget.style.color = '#e04c4c'}
      onBlur={(e) => e.currentTarget.style.color = '#64748b'}
    >
      <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>arrow_back</span>
      Back
    </button>
  );
}
