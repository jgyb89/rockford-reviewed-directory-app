"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { submitNewsletterForm } from "@/lib/actions";
import styles from "./Newsletter.module.css";

export default function Newsletter() {
  const sectionRef = useRef(null);

  const [status, setStatus] = useState("idle"); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const formData = new FormData(e.target);
    const result = await submitNewsletterForm(formData);

    if (result.success) {
      setStatus("success");
      e.target.reset(); // Clear the input
    } else {
      setStatus("error");
      setErrorMessage(result.error);
    }
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(sectionRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="newsletter" ref={sectionRef} className={styles.newsletterSection}>
      <div className={styles.gradientBg}></div>
      <div className={styles.container}>
        {/* LEFT COLUMN: Images */}
        <div className={styles.imagesColumn}>
          <div
            className={`${styles.imageWrapper} ${styles.imgPilates}`}
          >
            <Image
              src="/cape-coral-newsletter-pilates.png"
              alt="Pilates in Rockford"
              fill
              className={styles.imageFit}
            />
          </div>
          <div
            className={`${styles.imageWrapper} ${styles.imgBikeNight}`}
          >
            <Image
              src="/cape-coral-newsletter-bike-night.png"
              alt="Rockford Bike Night"
              fill
              className={styles.imageFit}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className={styles.formColumn}>
          <div className={styles.headlineMaskContainer}>
            <h2 className="breeze-text">
              Stay Connected to Rockford Reviews, Events & Local Finds
            </h2>
          </div>
          <p className="breeze-text">
            Want the latest Rockford reviews, restaurant features, business spotlights, event updates, and community recommendations? Subscribe to Rockford Reviewed and keep up with what is happening around Rockford, Michigan.
          </p>
          <form
            className={styles.formGroup}
            onSubmit={handleSubmit}
          >
            {status === "success" ? (
              <div className={styles.successMessage}>
                <p>Thanks for subscribing! Keep an eye on your inbox.</p>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className={styles.input}
                  disabled={status === "loading"}
                  required
                />
                <button type="submit" disabled={status === "loading"} className={`${styles.submitBtn} breeze-text`}>
                  {status === "loading" ? "Subscribing..." : "Subscribe for Updates"}
                </button>
                {status === "error" && (
                  <p className={styles.errorText}>{errorMessage}</p>
                )}
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
