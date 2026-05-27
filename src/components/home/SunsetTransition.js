"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./SunsetTransition.module.css";

export default function SunsetTransition() {
  const sectionRef = useRef(null);
  const containerRef = useRef(null);
  const sunRef = useRef(null);
  const reflectionRef = useRef(null);
  const oceanWrapperRef = useRef(null);
  const cloudLeftRef = useRef(null);
  const cloudRightRef = useRef(null);
  const cloudReflectLeftRef = useRef(null);
  const cloudReflectRightRef = useRef(null);
  const palmLandingRef = useRef(null);
  const modalRef = useRef(null);
  const starsRef = useRef(null);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 901px)",
        isMobile: "(max-width: 900px)",
      },
      (context) => {
        let { isDesktop } = context.conditions;

        // 1. INITIAL SCENE FADE IN
        gsap.fromTo(
          containerRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: 1.5,
            ease: "power2.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top bottom", // CHANGED: Fades in immediately as it enters the viewport
              toggleActions: "play none none reverse",
            },
          }
        );

        // 2. MAIN VISUAL SCRUB TIMELINE
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom", // Starts just before the sky element (entering viewport)
            end: "bottom bottom", // Completely stops exactly when DarkArea starts to enter
            scrub: 1.5,
          },
        });

        // Background transition hooks
        tl.to("body", { backgroundColor: "#231f20", duration: 0.2, ease: "none" }, 0);
        tl.to(sectionRef.current, { backgroundColor: "#231f20", duration: 0.2, ease: "none" }, 0);

        // RESPONSIVE ANIMATION BUDGETS (Animate concurrently from start)
        if (isDesktop) {
          tl.to(sunRef.current, { y: "15vh", scale: 1, duration: 1, ease: "power1.inOut" }, 0);
          tl.to(oceanWrapperRef.current, { height: "50vh", duration: 1, ease: "power1.inOut" }, 0);
          tl.to(palmLandingRef.current, { y: "-10vh", duration: 1, ease: "power1.inOut" }, 0);
        } else {
          // Condensed Mobile Motions
          tl.to(sunRef.current, { y: "6vh", scale: 0.9, duration: 1, ease: "power1.inOut" }, 0);
          tl.to(oceanWrapperRef.current, { height: "35vh", duration: 1, ease: "power1.inOut" }, 0);
          tl.to(palmLandingRef.current, { y: "-4vh", duration: 1, ease: "power1.inOut" }, 0);
        }

        // Shared background parallax translations (Run from 0 to 1)
        tl.to(reflectionRef.current, { scaleY: 1, duration: 1, ease: "power1.inOut" }, 0);
        tl.to(cloudLeftRef.current, { x: "8vw", duration: 1, ease: "power1.out" }, 0);
        tl.to(cloudRightRef.current, { x: "-8vw", duration: 1, ease: "power1.out" }, 0);
        tl.to(cloudReflectLeftRef.current, { scaleY: 1, x: "8vw", duration: 1, ease: "power1.inOut" }, 0);
        tl.to(cloudReflectRightRef.current, { scaleY: 1, x: "-8vw", duration: 1, ease: "power1.inOut" }, 0);

        // 3. THE MODAL SLIDE-IN
        // By placing it at the 0 position with a duration of 0.5, it reaches opacity 1 
        // exactly at the 0.5 mark. This guarantees it is in full view exactly halfway!
        tl.fromTo(
          modalRef.current,
          { opacity: 0, y: isDesktop ? 80 : 30 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0 // CHANGED from 0.7 to 0
        );
      }
    );

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.transitionSection}>
      <div ref={containerRef} className={styles.animationViewport}>
        
        {/* Sky */}
        <div className={styles.sky}>
          <Image src="/sunset-sky.svg" alt="Sunset Sky" fill className={styles.imageFit} priority />
        </div>

        {/* Clouds */}
        <div ref={cloudLeftRef} className={styles.cloudLeft}>
          <Image src="/cloud-group-left.svg" alt="Cloud Left" fill className={styles.imageFitContain} />
        </div>
        <div ref={cloudRightRef} className={styles.cloudRight}>
          <Image src="/cloud-group-right.svg" alt="Cloud Right" fill className={styles.imageFitContain} />
        </div>

        {/* Sun */}
        <div ref={sunRef} className={styles.sun}>
          <Image src="/sun-vector.svg" alt="Sun" fill className={styles.imageFitContain} />
        </div>

        {/* Ocean Wrapper */}
        <div ref={oceanWrapperRef} className={styles.oceanWrapper}>
          <div className={styles.oceanBackground}>
            <Image src="/ocean.svg" alt="Ocean Content" fill className={styles.imageFit} />
          </div>
          <div ref={reflectionRef} className={styles.reflection}>
            <Image src="/ocean-reflection.svg" alt="Reflection" fill className={styles.imageFitContainTop} />
          </div>
          <div ref={cloudReflectLeftRef} className={styles.cloudReflectLeft}>
            <Image src="/cloud-reflect-left.svg" alt="Cloud Reflection Left" fill className={styles.imageFitContainTop} />
          </div>
          <div ref={cloudReflectRightRef} className={styles.cloudReflectRight}>
            <Image src="/cloud-reflect-right.svg" alt="Cloud Reflection Right" fill className={styles.imageFitContainTop} />
          </div>
        </div>

        {/* Palm Landing */}
        <div ref={palmLandingRef} className={styles.palmLanding}>
          <Image src="/Palm-landing.svg" alt="Palm Landing" fill className={styles.imageFitCoverBottom} />
        </div>

        {/* Floating Intro Modal */}
        <div ref={modalRef} className={styles.introModal}>
          <div className={styles.modalLogo}>
            <Image src="/cape-coral-reviewed-round-logo-white.webp" alt="Cape Coral Reviewed Logo" fill className={styles.imageFitContain} />
          </div>
          <h3>Verified by locals, reviewed for you</h3>
          <p>Find top-rated local businesses, hidden dining gems, upcoming events, and trusted services right here in the Cape.</p>
        </div>

      </div>

      {/* Dark Narrative Block */}
      <div className={styles.darkArea}>
        <div className={styles.darkContent}>
          <div ref={starsRef} className={styles.starsRow}>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
            <span className="material-symbols-outlined">star</span>
          </div>
          <h2 ref={titleRef}>Cape Coral is more than just a destination</h2>
          <p ref={descriptionRef}>It’s a vibrant, fast-growing city of canals, entrepreneurship, and tight-knit neighborhoods.</p>
        </div>
      </div>
    </section>
  );
}
