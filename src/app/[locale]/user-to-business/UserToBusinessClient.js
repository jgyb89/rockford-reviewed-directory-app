"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import UserToBusinessForm from "@/components/UserToBusinessForm";
import styles from "./UserToBusiness.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function UserToBusinessClient({ dict, categoriesData }) {
  const containerRef = useRef(null);
  const heroRef = useRef(null);

  useGSAP(
    () => {
      // Hero Entrance Timeline
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-title-anim",
        { translateY: "110%" },
        { translateY: "0%", duration: 1.2, ease: "power3.out" },
      );

      tl.fromTo(
        ".hero-subtitle-anim",
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1.0, ease: "power2.out" },
        "-=0.9",
      );

      tl.fromTo(
        ".hero-features-anim",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.8",
      );

      tl.fromTo(
        ".hero-form-anim",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
        "-=0.8",
      );
    },
    { scope: containerRef }
  );

  const t = dict?.userToBusiness || {};

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroSection} ref={heroRef} style={{ minHeight: '100vh' }}>
        <div className={styles.heroContent}>
          <div className={styles.headlineMaskContainer}>
            <h1 className={`${styles.heroTitle} hero-title-anim`}>
              {t.title || "Upgrade to Business"}
            </h1>
          </div>
          <p className={`${styles.heroSubtitle} hero-subtitle-anim`}>
            {t.subtitle || "Get more out of Cape Coral Directory by upgrading your account."}
          </p>
          <div className={`${styles.heroFeatures} hero-features-anim`}>
            <div className={styles.heroFeatureItem}>
              <span className={`material-symbols-outlined ${styles.featureIcon}`}>
                storefront
              </span>
              Manage your listings
            </div>
            <div className={styles.heroFeatureItem}>
              <span className={`material-symbols-outlined ${styles.featureIcon}`}>
                analytics
              </span>
              View detailed analytics
            </div>
            <div className={styles.heroFeatureItem}>
              <span className={`material-symbols-outlined ${styles.featureIcon}`}>
                campaign
              </span>
              Post events and news
            </div>
          </div>
        </div>

        <div className={`${styles.heroFormWrapper} hero-form-anim`} id="upgrade-form">
          <div className={styles.formDecorativeBg}></div>
          <UserToBusinessForm dict={dict} categoriesData={categoriesData} />
        </div>
      </section>
    </div>
  );
}
