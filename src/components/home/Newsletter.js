"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { submitNewsletterForm } from "@/lib/actions";
import styles from "./Newsletter.module.css";

export default function Newsletter() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const pilatesRef = useRef(null);
  const bikeRef = useRef(null);

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
      // 1. Background Gradient Timeline
      const c1 = "#e94f37"; // Brand Red
      const c2 = "#ff8c00"; // Orange
      const c3 = "#ffd700"; // Yellow
      const c4 = "#32cd32"; // Lime Green
      const c5 = "#00ffff"; // Cyan

      gsap.set(bgRef.current, {
        background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`,
      });

      const bgTl = gsap.timeline({
        repeat: -1,
        defaults: {
          duration: 1.5, // slightly slower for a calmer flow
          ease: "none",
        },
      });

      bgTl
        .to(bgRef.current, {
          background: `linear-gradient(135deg, ${c2}, ${c3}, ${c4})`,
        })
        .to(bgRef.current, {
          background: `linear-gradient(135deg, ${c3}, ${c4}, ${c5})`,
        })
        .to(bgRef.current, {
          background: `linear-gradient(135deg, ${c4}, ${c5}, ${c1})`,
        })
        .to(bgRef.current, {
          background: `linear-gradient(135deg, ${c5}, ${c1}, ${c2})`,
        })
        .to(bgRef.current, {
          background: `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`,
        });

      // 2. Images slide and rotate in from bottom
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none reverse",
        },
      });

      tl.fromTo(
        [pilatesRef.current, bikeRef.current],
        {
          y: "150%",
          rotation: 0,
        },
        {
          y: "0%",
          duration: 1.2,
          ease: "power3.out",
          stagger: 0.2,
        },
      );

      // Apply the resting rotation staggered as well
      tl.to(
        pilatesRef.current,
        { rotation: -3, duration: 0.8, ease: "back.out(1.5)" },
        "-=0.8",
      );
      tl.to(
        bikeRef.current,
        { rotation: 8, duration: 0.8, ease: "back.out(1.5)" },
        "-=0.6",
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section id="newsletter" ref={sectionRef} className={styles.newsletterSection}>
      <div ref={bgRef} className={styles.gradientBg}></div>
      <div className={styles.container}>
        {/* LEFT COLUMN: Images */}
        <div className={styles.imagesColumn}>
          <div
            ref={pilatesRef}
            className={`${styles.imageWrapper} ${styles.imgPilates}`}
          >
            <Image
              src="/cape-coral-newsletter-pilates.png"
              alt="Pilates in Cape Coral"
              fill
              className={styles.imageFit}
            />
          </div>
          <div
            ref={bikeRef}
            className={`${styles.imageWrapper} ${styles.imgBikeNight}`}
          >
            <Image
              src="/cape-coral-newsletter-bike-night.png"
              alt="Cape Coral Bike Night"
              fill
              className={styles.imageFit}
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Form */}
        <div className={styles.formColumn}>
          <div className={styles.headlineMaskContainer}>
            <h2 className="breeze-text">
              Stay Updated on Cape Coral
            </h2>
          </div>
          <p className="breeze-text">
            Want the latest Cape Coral business reviews, restaurant features,
            event coverage, and local recommendations delivered straight to your
            inbox?
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
