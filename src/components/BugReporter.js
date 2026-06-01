"use client";

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { submitBugReport } from '@/lib/actions';
import styles from './BugReporter.module.css';

export default function BugReporter() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const pathname = usePathname();

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      ...formData,
      pageUrl: globalThis.location.origin + pathname,
    };

    try {
      const result = await submitBugReport(payload);
      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', description: '' });
        
        // Close modal after showing success message briefly
        globalThis.setTimeout(() => {
          setIsOpen(false);
          setSuccess(false);
        }, 3000);
      } else {
        alert(result.message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles['bug-reporter']}>
      {/* The Floating Action Button */}
      <button 
        className={styles['bug-reporter__trigger']} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Report a bug"
      >
        <span className="material-symbols-outlined">
          {isOpen ? 'close' : 'bug_report'}
        </span>
      </button>

      {/* The Pop-Up Modal */}
      {isOpen && (
        <div className={styles['bug-reporter__modal']}>
          <div className={styles['bug-reporter__header']}>
            <h3 className={styles['bug-reporter__title']}>Report an Issue</h3>
          </div>

          {success ? (
            <div className={styles['bug-reporter__success']}>
              <span className="material-symbols-outlined">check_circle</span>
              <p>Thanks! Report sent.</p>
            </div>
          ) : (
            <form className={styles['bug-reporter__form']} onSubmit={handleSubmit}>
              <div className={styles['bug-reporter__field']}>
                <label className={styles['bug-reporter__label']} htmlFor="bugName">Name</label>
                <input
                  id="bugName"
                  className={styles['bug-reporter__input']}
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>

              <div className={styles['bug-reporter__field']}>
                <label className={styles['bug-reporter__label']} htmlFor="bugDesc">Description</label>
                <textarea
                  id="bugDesc"
                  className={`${styles['bug-reporter__input']} ${styles['bug-reporter__input--textarea']}`}
                  required
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What went wrong?"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className={styles['bug-reporter__submit']}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send Report'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
