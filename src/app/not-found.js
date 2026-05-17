import PropTypes from 'prop-types';
import { poppins, openSans } from '@/app/fonts';
import { getViewer } from '@/lib/auth';
import Navbar from '@/components/layout/Navbar';
import "material-symbols/outlined.css";
import './globals.css';
import styles from './NotFound.module.css';

export default async function NotFound() {
  // Securely check if the user is authenticated on the server
  const viewer = await getViewer();

  return (
    <div 
      className={`${poppins.variable} ${openSans.variable}`}
      style={{ margin: 0, padding: 0, minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'var(--font-open-sans), sans-serif' }}
    >
      {/* Inject Navbar with fallback locale */}
      <Navbar locale="en" currentUser={viewer} />
      
      <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f8fafc' }}>
        <div className={styles['not-found']}>
          <div className={styles['not-found__content']}>
            <span className={`material-symbols-outlined ${styles['not-found__icon']}`}>
              location_off
            </span>
            <h1 className={styles['not-found__title']}>404 - Page Not Found</h1>
            <p className={styles['not-found__text']}>
              Oops! We couldn't find the page you were looking for. It might have been moved, deleted, or perhaps the URL is incorrect.
            </p>
            
            <div className={styles['not-found__actions']}>
              {/* Using <a> tags to force a hard reload and prevent HTML layout nesting errors */}
              <a href="/" className={`${styles['not-found__btn']} ${styles['not-found__btn--primary']}`}>
                <span className="material-symbols-outlined">home</span>{" "}
                Back to Homepage
              </a>
              
              {/* Conditional Button based on Auth State */}
              {viewer ? (
                <a href="/dashboard" className={`${styles['not-found__btn']} ${styles['not-found__btn--secondary']}`}>
                  <span className="material-symbols-outlined">person</span>{" "}
                  Go to Profile
                </a>
              ) : (
                <a href="/directory" className={`${styles['not-found__btn']} ${styles['not-found__btn--secondary']}`}>
                  <span className="material-symbols-outlined">storefront</span>{" "}
                  View Directory
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
