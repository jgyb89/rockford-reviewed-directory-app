'use client';

import { useState } from 'react';
import { submitNewsletterForm } from '@/lib/actions';

export default function NewsletterWidget() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    const formData = new FormData(e.target);
    const result = await submitNewsletterForm(formData);

    if (result.success) {
      setStatus('success');
      e.target.reset();
    } else {
      setStatus('error');
      setErrorMessage(result.error);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '2rem',
      margin: '2.5rem 0',
      textAlign: 'center',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#e94f37', marginBottom: '0.5rem' }}>
        mail
      </span>
      <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>
        Stay Updated on Cape Coral
      </h3>
      <p style={{ color: '#475569', marginBottom: '1.5rem', fontSize: '0.95rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
        Get the latest local business reviews, events, and community news delivered straight to your inbox.
      </p>

      {status === 'success' ? (
        <div style={{ background: '#ecfdf5', color: '#065f46', padding: '1rem', borderRadius: '8px', border: '1px solid #10b981', display: 'inline-block' }}>
          <strong>Thanks for subscribing!</strong> Keep an eye on your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', maxWidth: '450px', margin: '0 auto', flexDirection: 'column' }}>
          <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              disabled={status === 'loading'}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                background: '#e94f37',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                opacity: status === 'loading' ? 0.7 : 1,
                transition: 'background 0.2s'
              }}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {status === 'error' && (
            <p style={{ color: '#e04c4c', fontSize: '0.85rem', margin: '0.5rem 0 0 0', textAlign: 'left' }}>{errorMessage}</p>
          )}
        </form>
      )}
    </div>
  );
}
