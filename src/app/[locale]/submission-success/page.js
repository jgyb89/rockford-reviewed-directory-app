'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function SubmissionSuccessPage() {
  const params = useParams();
  const locale = params.locale || 'en';
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          return 100;
        }
        return old + 2; // Fills to 100% over ~5 seconds
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', backgroundColor: '#fdfdfd' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: '#fff', padding: '3rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '4rem', color: '#4caf50', marginBottom: '1rem' }}>check_circle</span>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--font-heading)', fontWeight: 800 }}>Submission Successful!</h1>
        <p style={{ color: '#666', marginBottom: '2rem', lineHeight: '1.6', fontSize: '1.1rem' }}>
          Your business listing has been securely transmitted. It typically takes a few moments for our servers to process your media, optimize your images, and publish the listing to the global directory.
        </p>

        <div style={{ width: '100%', height: '8px', backgroundColor: '#edf2f7', borderRadius: '4px', overflow: 'hidden', marginBottom: '2rem' }}>
          <div style={{ height: '100%', width: `${progress}%`, backgroundColor: '#4caf50', transition: 'width 0.1s linear' }} />
        </div>

        {progress === 100 ? (
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={`/dashboard`} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#e57007', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: '600' }}>
              Go to Dashboard
            </Link>
            <Link href={``} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#edf2f7', color: '#2d3748', textDecoration: 'none', borderRadius: '6px', fontWeight: '600' }}>
              Back to Home
            </Link>
          </div>
        ) : (
          <p style={{ color: '#a0aec0', fontSize: '0.95rem', fontWeight: '600' }}>Processing your listing...</p>
        )}
      </div>
    </main>
  );
}
