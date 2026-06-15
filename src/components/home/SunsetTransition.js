"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import {
  Utensils,
  HeartPulse,
  Home,
  Coffee,
  Sparkles,
  Wrench,
  Wine,
  Dumbbell,
  PawPrint,
} from "lucide-react";
import Link from "next/link";
import styles from "./SunsetTransition.module.css";

const CATEGORIES = [
  // Top row
  { name: "Food & Drink", icon: Utensils, url: "/directory/food-drink" },
  {
    name: "Health & Wellness",
    icon: HeartPulse,
    url: "/directory/health-wellness",
  },
  { name: "Home & Local", icon: Home, url: "/directory/home-local-services" },
  // Middle row
  {
    name: "Cafe and Bakeries",
    icon: Coffee,
    url: "/directory/food-drink/cafes-bakeries",
  },
  {
    name: "Beauty & Spas",
    icon: Sparkles,
    url: "/directory/health-wellness/beauty-spas",
  },
  {
    name: "Contractors",
    icon: Wrench,
    url: "/directory/home-local-services/contractors-repair",
  },
  // Bottom row
  {
    name: "Bars & Nightlife",
    icon: Wine,
    url: "/directory/food-drink/bars-nightlife",
  },
  {
    name: "Fitness & Sports",
    icon: Dumbbell,
    url: "/directory/health-wellness/fitness-sports",
  },
  {
    name: "Pet Services",
    icon: PawPrint,
    url: "/directory/home-local-services/pet-services",
  },
];

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

  const star1Ref = useRef(null);
  const star2Ref = useRef(null);
  const star3Ref = useRef(null);
  const star4Ref = useRef(null);

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
          },
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
        tl.to(
          "body",
          { backgroundColor: "#231f20", duration: 0.2, ease: "none" },
          0,
        );
        tl.to(
          sectionRef.current,
          { backgroundColor: "#231f20", duration: 0.2, ease: "none" },
          0,
        );

        // RESPONSIVE ANIMATION BUDGETS (Animate concurrently from start)
        if (isDesktop) {
          tl.to(
            sunRef.current,
            { y: "15vh", scale: 1, duration: 1, ease: "power1.inOut" },
            0,
          );
          tl.to(
            oceanWrapperRef.current,
            { height: "50vh", duration: 1, ease: "power1.inOut" },
            0,
          );
          tl.to(
            palmLandingRef.current,
            { y: "-10vh", duration: 1, ease: "power1.inOut" },
            0,
          );
        } else {
          // Condensed Mobile Motions
          tl.to(
            sunRef.current,
            { y: "6vh", scale: 0.9, duration: 1, ease: "power1.inOut" },
            0,
          );
          tl.to(
            oceanWrapperRef.current,
            { height: "35vh", duration: 1, ease: "power1.inOut" },
            0,
          );
          tl.to(
            palmLandingRef.current,
            { y: "-4vh", duration: 1, ease: "power1.inOut" },
            0,
          );
        }

        // Shared background parallax translations (Run from 0 to 1)
        tl.to(
          reflectionRef.current,
          { scaleY: 1, duration: 1, ease: "power1.inOut" },
          0,
        );
        tl.to(
          cloudLeftRef.current,
          { x: "8vw", duration: 1, ease: "power1.out" },
          0,
        );
        tl.to(
          cloudRightRef.current,
          { x: "-8vw", duration: 1, ease: "power1.out" },
          0,
        );
        tl.to(
          cloudReflectLeftRef.current,
          { scaleY: 1, x: "8vw", duration: 1, ease: "power1.inOut" },
          0,
        );
        tl.to(
          cloudReflectRightRef.current,
          { scaleY: 1, x: "-8vw", duration: 1, ease: "power1.inOut" },
          0,
        );

        // 3. THE MODAL SLIDE-IN
        // Desktop: Starts 80px down.
        // Mobile: Starts 50px down (a shorter, punchier entrance).
        tl.fromTo(
          modalRef.current,
          { opacity: 0, y: isDesktop ? 80 : 50 },
          { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
          0
        );
      },
    );

    const stars = [
      star1Ref.current,
      star2Ref.current,
      star3Ref.current,
      star4Ref.current,
    ].filter(Boolean);

    gsap.set(stars, { transformOrigin: "center center" });

    const xTween = gsap.fromTo(
      stars,
      {
        x: -20,
        xPercent: -50,
      },
      {
        x: 20,
        xPercent: -50,
        paused: true,
      },
    );

    const yTween = gsap.fromTo(
      stars,
      {
        yPercent: -50,
        y: -20,
      },
      {
        yPercent: -50,
        y: 20,
        paused: true,
      },
    );

    const onMouseMove = (e) => {
      xTween.progress(e.clientX / window.innerWidth);
      yTween.progress(e.clientY / window.innerHeight);
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      mm.revert();
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section ref={sectionRef} className={styles.transitionSection}>
      <div ref={containerRef} className={styles.animationViewport}>
        {/* Sky */}
        <div className={styles.sky}>
          <Image
            src="/sunset-sky.svg"
            alt="Sunset Sky"
            fill
            className={styles.imageFit}
            priority
          />
        </div>

        {/* Stars */}
        <div
          ref={star1Ref}
          className={`${styles.star} ${styles.starLeftSmall}`}
        >
          <Image
            src="/sky-star-icon.svg"
            alt="Star"
            fill
            className={styles.imageFitContain}
          />
        </div>
        <div
          ref={star2Ref}
          className={`${styles.star} ${styles.starLeftLarge}`}
        >
          <Image
            src="/sky-star-icon.svg"
            alt="Star"
            fill
            className={styles.imageFitContain}
          />
        </div>
        <div
          ref={star3Ref}
          className={`${styles.star} ${styles.starRightSmall}`}
        >
          <Image
            src="/sky-star-icon.svg"
            alt="Star"
            fill
            className={styles.imageFitContain}
          />
        </div>
        <div
          ref={star4Ref}
          className={`${styles.star} ${styles.starRightLarge}`}
        >
          <Image
            src="/sky-star-icon.svg"
            alt="Star"
            fill
            className={styles.imageFitContain}
          />
        </div>

        {/* Clouds */}
        <div ref={cloudLeftRef} className={styles.cloudLeft}>
          <Image
            src="/cloud-group-left.svg"
            alt="Cloud Left"
            fill
            className={styles.imageFitContain}
          />
        </div>
        <div ref={cloudRightRef} className={styles.cloudRight}>
          <Image
            src="/cloud-group-right.svg"
            alt="Cloud Right"
            fill
            className={styles.imageFitContain}
          />
        </div>

        {/* Sun */}
        <div ref={sunRef} className={styles.sun}>
          <Image
            src="/sun-vector.svg"
            alt="Sun"
            fill
            className={styles.imageFitContain}
          />
        </div>

        {/* Ocean Wrapper */}
        <div ref={oceanWrapperRef} className={styles.oceanWrapper}>
          <div className={styles.oceanBackground}>
            <Image
              src="/ocean.svg"
              alt="Ocean Content"
              fill
              className={styles.imageFit}
            />
          </div>
          <div ref={reflectionRef} className={styles.reflection}>
            <Image
              src="/ocean-reflection.svg"
              alt="Reflection"
              fill
              className={styles.imageFitContainTop}
            />
          </div>
          <div ref={cloudReflectLeftRef} className={styles.cloudReflectLeft}>
            <Image
              src="/cloud-reflect-left.svg"
              alt="Cloud Reflection Left"
              fill
              className={styles.imageFitContainTop}
            />
          </div>
          <div ref={cloudReflectRightRef} className={styles.cloudReflectRight}>
            <Image
              src="/cloud-reflect-right.svg"
              alt="Cloud Reflection Right"
              fill
              className={styles.imageFitContainTop}
            />
          </div>
        </div>

        {/* Palm Landing */}
        <div ref={palmLandingRef} className={styles.palmLanding}>
          <Image
            src="/Palm-landing.svg"
            alt="Palm Landing"
            fill
            className={styles.imageFitCoverBottom}
          />
        </div>

        {/* Floating Intro Modal */}
        <div ref={modalRef} className={styles.introModal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              Explore Cape Coral
            </h2>
            <div className={styles.categoryGrid}>
              {CATEGORIES.map((cat, idx) => (
                <Link href={cat.url} key={idx} className={styles.categoryCard}>
                  <cat.icon size={32} className={styles.categoryIcon} />
                  <span className={styles.categoryName}>{cat.name}</span>
                </Link>
              ))}
            </div>
            <div className={styles.modalFooter}>
              <Link
                href="/directory"
                className={`${styles.primaryBtn} breeze-text`}
              >
                View Full Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
