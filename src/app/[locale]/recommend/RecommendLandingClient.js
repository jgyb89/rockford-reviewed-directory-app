"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import RecommendBusinessForm from "@/components/RecommendBusinessForm";
import styles from "./RecommendLanding.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function RecommendLandingClient() {
  const containerRef = useRef(null);
  const heroRef = useRef(null);
  const videoRef = useRef(null);
  const benefitsRef = useRef(null);
  const aboutRef = useRef(null);

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

      // Video Zoom Animation on Scroll
      gsap.fromTo(
        videoRef.current,
        { scale: 0.8, borderRadius: "48px" },
        {
          scale: 1,
          borderRadius: "24px",
          ease: "none",
          scrollTrigger: {
            trigger: videoRef.current,
            start: "top bottom",
            end: "center center",
            scrub: true,
          },
        },
      );

      // Benefits Stagger Animation
      gsap.fromTo(
        ".benefit-card",
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: "top 80%",
          },
        },
      );

      // About Section Fade
      gsap.fromTo(
        aboutRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: aboutRef.current,
            start: "top 85%",
          },
        },
      );
    },
    { scope: containerRef },
  );

  const scrollToForm = (e) => {
    e.preventDefault();
    const formElement = document.getElementById("recommend-form");
    if (formElement) {
      window.scrollTo({
        top: formElement.offsetTop - 100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Hero Section */}
      <section className={styles.heroSection} ref={heroRef}>
        <div className={styles.heroContent}>
          <div className={styles.headlineMaskContainer}>
            <h1 className={`${styles.heroTitle} hero-title-anim`}>
              Recommend Your Favorite{" "}
              <span className={styles.heroHighlight}>Local Businesses</span>
            </h1>
          </div>
          <p className={`${styles.heroSubtitle} hero-subtitle-anim`}>
            Know a local hidden gem or a business that provides outstanding
            service in Cape Coral, Florida? Recommend them to be added to our
            premier local directory and featured across our platforms.
          </p>
          <div className={`${styles.heroFeatures} hero-features-anim`}>
            <div className={styles.heroFeatureItem}>
              <span
                className={`material-symbols-outlined ${styles.featureIcon}`}
              >
                campaign
              </span>
              Reach thousands of local residents
            </div>
            <div className={styles.heroFeatureItem}>
              <span
                className={`material-symbols-outlined ${styles.featureIcon}`}
              >
                thumb_up
              </span>
              100% Free for recommended businesses
            </div>
            <div className={styles.heroFeatureItem}>
              <span
                className={`material-symbols-outlined ${styles.featureIcon}`}
              >
                verified
              </span>
              Boost their local credibility and SEO
            </div>
          </div>
        </div>

        <div
          className={`${styles.heroFormWrapper} hero-form-anim`}
          id="recommend-form"
        >
          <div className={styles.formDecorativeBg}></div>
          <RecommendBusinessForm />
        </div>
      </section>

      {/* Video Section */}
      <section className={styles.videoSection}>
        <div className={styles.videoContainerWrapper} ref={videoRef}>
          <iframe
            className={styles.youtubeIframe}
            src="https://www.youtube.com/embed/HnmMHKl2bX0?rel=0"
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection} ref={benefitsRef}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Why Recommend A Business?</h2>
          <p className={styles.sectionSubtitle}>
            When you recommend a business, you aren&apos;t just giving them a
            shoutout. You&apos;re entering them into our comprehensive spotlight
            program designed to supercharge their local presence.
          </p>
        </div>

        <div className={styles.benefitsGrid}>
          {/* Benefit 1 */}
          <div className={`${styles.benefitCard} benefit-card`}>
            <div className={styles.benefitIconWrapper}>
              <span
                className={`material-symbols-outlined ${styles.benefitIcon}`}
              >
                smart_display
              </span>
            </div>
            <h3 className={styles.benefitTitle}>YouTube Spotlight</h3>
            <p className={styles.benefitDesc}>
              Selected businesses receive a dedicated, high-quality video
              spotlight on our growing YouTube channel, showcasing what makes
              them special.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className={`${styles.benefitCard} benefit-card`}>
            <div className={styles.benefitIconWrapper}>
              <span
                className={`material-symbols-outlined ${styles.benefitIcon}`}
              >
                mark_email_read
              </span>
            </div>
            <h3 className={styles.benefitTitle}>Newsletter Feature</h3>
            <p className={styles.benefitDesc}>
              We highlight recommended businesses in our weekly newsletter,
              delivered straight to the inboxes of engaged Cape Coral locals.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className={`${styles.benefitCard} benefit-card`}>
            <div className={styles.benefitIconWrapper}>
              <span
                className={`material-symbols-outlined ${styles.benefitIcon}`}
              >
                groups
              </span>
            </div>
            <h3 className={styles.benefitTitle}>Facebook Group Spotlight</h3>
            <p className={styles.benefitDesc}>
              Exclusive promotion in our active Facebook community featuring
              over 10k engaged members looking for the best local spots.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className={`${styles.benefitCard} benefit-card`}>
            <div className={styles.benefitIconWrapper}>
              <span
                className={`material-symbols-outlined ${styles.benefitIcon}`}
              >
                share
              </span>
            </div>
            <h3 className={styles.benefitTitle}>Social Media Promotion</h3>
            <p className={styles.benefitDesc}>
              Comprehensive cross-platform promotion on Instagram, TikTok, and
              Twitter to ensure maximum local visibility and reach.
            </p>
          </div>

          {/* Benefit 5 */}
          <div className={`${styles.benefitCard} benefit-card`}>
            <div className={styles.benefitIconWrapper}>
              <span
                className={`material-symbols-outlined ${styles.benefitIcon}`}
              >
                campaign
              </span>
            </div>
            <h3 className={styles.benefitTitle}>Showcase Your Business</h3>
            <p className={styles.benefitDesc}>
              Would you love to get press for your business? We invite any
              business to reach out!
            </p>
          </div>

          {/* Benefit 6 */}
          <div className={`${styles.benefitCard} benefit-card`}>
            <div className={styles.benefitIconWrapper}>
              <span
                className={`material-symbols-outlined ${styles.benefitIcon}`}
              >
                favorite
              </span>
            </div>
            <h3 className={styles.benefitTitle}>Support Your Favorites</h3>
            <p className={styles.benefitDesc}>
              This is the chance to really spotlight your favorite place that
              you feel deserves much more recognition!
            </p>
          </div>
        </div>

        <div className={styles.ctaContainer}>
          <button
            onClick={scrollToForm}
            className={`${styles.ctaButton} ${styles.ctaButtonPrimary}`}
          >
            Recommend A Business Now
            <span className="material-symbols-outlined">arrow_upward</span>
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.aboutSection}>
        <div className={styles.aboutContainer} ref={aboutRef}>
          <h2 className={styles.aboutTitle}>What is Cape Coral Reviewed?</h2>
          <p className={styles.aboutDesc}>
            Cape Coral Reviewed is the premier destination for discovering the
            absolute best that our city has to offer. We are passionate locals
            dedicated to uncovering hidden gems, highlighting outstanding
            services, and building a stronger community. Whether it&apos;s a
            family-owned restaurant, a reliable contractor, or a unique local
            boutique, our mission is to connect great people with great
            businesses.
          </p>
          <button onClick={scrollToForm} className={styles.ctaButton}>
            Submit Your Recommendation
          </button>
        </div>
      </section>
    </div>
  );
}
