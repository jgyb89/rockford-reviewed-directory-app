'use client';

import { useState, useEffect } from 'react';
import styles from './CookieConsent.module.css';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [view, setView] = useState('banner'); // 'banner' or 'preferences'
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true
    preferences: false,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent cookie already exists
    const hasConsent = document.cookie.split('; ').find(row => row.startsWith('ccr_cookie_consent='));
    if (!hasConsent) {
      setIsVisible(true);
    }
  }, []);

  const saveCookies = (prefs) => {
    // Save for 365 days
    document.cookie = `ccr_cookie_consent=${JSON.stringify(prefs)}; max-age=31536000; path=/`;
    setIsVisible(false);

    // Optional: Reload to let the server instantly inject newly approved scripts
    window.location.reload(); 
  };

  const handleAcceptAll = () => {
    saveCookies({ necessary: true, preferences: true, statistics: true, marketing: true });
  };

  const handleDeclineAll = () => {
    saveCookies({ necessary: true, preferences: false, statistics: false, marketing: false });
  };

  const handleSavePreferences = () => {
    saveCookies(preferences);
  };

  const togglePref = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <>
      {view === 'preferences' && <div className={styles.overlay} />}

      <div className={view === 'preferences' ? styles.modal : styles.banner}>
        {view === 'banner' ? (
          <>
            <h2 className={styles.title}>We value your privacy</h2>
            <p className={styles.text}>
              We use cookies to analyze website traffic and optimize your website experience. By accepting our use of cookies, your data will be aggregated with all other user data.
            </p>
            <div className={styles.buttonGroup}>
              <button onClick={handleDeclineAll} className={`${styles.btn} ${styles.btnSecondary}`}>Decline</button>
              <button onClick={handleAcceptAll} className={`${styles.btn} ${styles.btnPrimary}`}>Accept</button>
              <button onClick={() => setView('preferences')} className={`${styles.btn} ${styles.btnText}`} style={{ flexBasis: '100%' }}>Preferences</button>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.title}>Cookie Preferences</h2>
            <p className={styles.text}>
              When you visit any website, it may store or retrieve information on your browser, mostly in the form of cookies. This information might be about you, your preferences or your device.
            </p>

            <div className={styles.accordionList}>
              <details className={styles.accordion}>
                <summary className={styles.accordionSummary}>
                  Necessary 
                  <span style={{ color: '#10b981', fontSize: '0.85rem' }}>Always Active</span>
                </summary>
                <div className={styles.accordionContent}>
                  Necessary cookies help make a website usable by enabling basic functions like page navigation and access to secure areas. The website cannot function properly without these cookies.
                </div>
              </details>

              <details className={styles.accordion}>
                <summary className={styles.accordionSummary}>
                  Preferences
                  <label className={styles.toggle} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={preferences.preferences} onChange={() => togglePref('preferences')} />
                    <span className={styles.slider}></span>
                  </label>
                </summary>
                <div className={styles.accordionContent}>
                  Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in.
                </div>
              </details>

              <details className={styles.accordion}>
                <summary className={styles.accordionSummary}>
                  Statistics
                  <label className={styles.toggle} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={preferences.statistics} onChange={() => togglePref('statistics')} />
                    <span className={styles.slider}></span>
                  </label>
                </summary>
                <div className={styles.accordionContent}>
                  Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously. (e.g. Google Analytics)
                </div>
              </details>

              <details className={styles.accordion}>
                <summary className={styles.accordionSummary}>
                  Marketing
                  <label className={styles.toggle} onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={preferences.marketing} onChange={() => togglePref('marketing')} />
                    <span className={styles.slider}></span>
                  </label>
                </summary>
                <div className={styles.accordionContent}>
                  Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user. (e.g. Facebook Pixel)
                </div>
              </details>
            </div>

            <div className={styles.buttonGroup}>
              <button onClick={handleSavePreferences} className={`${styles.btn} ${styles.btnPrimary}`}>Save Preferences</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
