'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ContactForm from '@/components/ContactForm';
import styles from './ContactLanding.module.css';

export default function ContactLandingClient() {
  const containerRef = useRef(null);
  const contactRef = useRef(null);

  useGSAP(() => {
    // Contact Entry Animation
    gsap.fromTo('.contact-anim',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
    );
  }, { scope: containerRef });

  return (
    <div className={styles.container} ref={containerRef}>
      
      {/* Contact Section */}
      <section className={styles.contactSection} ref={contactRef}>
        <div className={styles.contactContent}>
          <h1 className={`${styles.contactTitle} contact-anim`}>
            Let's Start a <span className={styles.contactHighlight}>Conversation</span>
          </h1>
          <p className={`${styles.contactSubtitle} contact-anim`}>
            Whether you have a question about our directory, want to explore partnership opportunities, or just want to say hello, we're ready to answer all your questions.
          </p>
          
          <div className={`${styles.contactInfoGrid} contact-anim`}>
            <div className={styles.contactInfoItem}>
              <div className={styles.infoIcon}>
                <span className="material-symbols-outlined">forum</span>
              </div>
              <div className={styles.infoText}>
                <h3>General Inquiries</h3>
                <p>Reach out and we'll get back to you as soon as we can.</p>
              </div>
            </div>
            
            <div className={styles.contactInfoItem}>
              <div className={styles.infoIcon}>
                <span className="material-symbols-outlined">handshake</span>
              </div>
              <div className={styles.infoText}>
                <h3>Partnerships</h3>
                <p>Interested in collaborating? Let's discuss how we can work together.</p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.infoIcon}>
                <span className="material-symbols-outlined">support_agent</span>
              </div>
              <div className={styles.infoText}>
                <h3>Support</h3>
                <p>Need help with your business listing? We're here to assist.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className={`${styles.contactFormWrapper} contact-anim`}>
          <div className={styles.formDecorativeBg}></div>
          <ContactForm />
        </div>
      </section>

    </div>
  );
}
