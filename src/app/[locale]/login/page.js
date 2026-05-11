import PropTypes from 'prop-types';
import { getDictionary } from '@/lib/dictionaries';
import LoginForm from '@/components/auth/LoginForm';
import RecoverPasswordForm from '@/components/auth/RecoverPasswordForm';
import Link from 'next/link';

export const metadata = {
  title: 'Sign In | Cape Coral Reviewed',
};

export default async function LoginPage({ params, searchParams }) {
  const { locale } = await params;
  
  // Safely await searchParams in Next.js 15+
  const resolvedSearchParams = await searchParams;
  const isRecover = resolvedSearchParams?.recover === 'true';

  return (
    <main style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#f8fafc'
    }}>
      {isRecover ? (
        <>
          <RecoverPasswordForm />
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <Link href={`/${locale}/login`} style={{ color: '#64748b', textDecoration: 'none', fontWeight: '500' }}>
              &larr; Back to Sign In
            </Link>
          </div>
        </>
      ) : (
        <>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b', marginBottom: '0.5rem' }}>
              Welcome Back
            </h1>
            <p style={{ color: '#64748b' }}>Sign in to manage your directory listings and reviews.</p>
          </div>

          <LoginForm />

          <div style={{ marginTop: '1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Link href={`/${locale}/login?recover=true`} style={{ color: '#e04c4c', textDecoration: 'none', fontWeight: '500' }}>
              Forgot your password?
            </Link>
            <p style={{ color: '#64748b', margin: 0 }}>
              Don't have an account?{' '}
              <Link href={`/${locale}/register`} style={{ color: '#e04c4c', fontWeight: '600', textDecoration: 'none' }}>
                Sign Up
              </Link>
            </p>
          </div>
        </>
      )}
    </main>
  );
}

LoginPage.propTypes = {
  params: PropTypes.object.isRequired,
  searchParams: PropTypes.object.isRequired,
};
