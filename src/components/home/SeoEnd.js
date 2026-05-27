"use client";

import { forwardRef, useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./SeoEnd.module.css";

const SeoEnd = forwardRef((props, ref) => {
  const localWrapperRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // 1. Entrance tilt animation for the card
      gsap.fromTo(
        cardRef.current,
        {
          scale: 0.85,
          rotationZ: -4,  // Tilted to the left
          y: "25vh",
        },
        {
          scale: 1,
          rotationZ: 0,
          y: 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: localWrapperRef.current,
            start: "top 95%",
            end: "top top",
            scrub: 1,
          },
        }
      );

      // 2. Slide up entrance animation for the icons
      gsap.fromTo(
        `.${styles.iconWrapper}`,
        { y: 120, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: localWrapperRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          }
        }
      );

      // 3. Floating loops for the inner icon wrappers
      const inners = gsap.utils.toArray(`.${styles.floatInner}`);
      inners.forEach((el, i) => {
        const dy = i === 0 ? -15 : i === 1 ? 12 : -18;
        const dur = i === 0 ? 2.5 : i === 1 ? 2.0 : 2.8;
        const delay = i * 0.3;

        gsap.to(el, {
          y: dy,
          duration: dur,
          delay: delay,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      });

    }, localWrapperRef);

    return () => ctx.revert();
  }, []);

  const setRefs = (el) => {
    localWrapperRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) ref.current = el;
  };

  return (
    <div ref={setRefs} className={styles.stickyWrapper}>
      <div ref={cardRef} className={styles.flashCard}>
        <div className={styles.contentMaxWidth}>
          <div className={styles.splitGrid}>
            
            {/* LEFT COLUMN: 2/3 Width Text narrative */}
            <div className={styles.leftTextColumn}>
              <div className={styles.headlineMaskContainer}>
                <h2 className="breeze-text">Real Reviews. Local Spots. Better Recommendations.</h2>
              </div>
              <p className="breeze-text">
                We’re not here to create another noisy online group full of random posts and arguments. Cape Coral Reviewed is focused on useful information, helpful recommendations, and local businesses that are worth knowing about. Less noise. Better information. Stronger local connections. That’s Cape Coral Reviewed.
              </p>
            </div>

            {/* RIGHT COLUMN: 1/3 Width Graphics Icons Layout */}
            <div className={styles.rightGraphicsColumn}>
              <div className={styles.gridContainer}>
                {/* Top 1-Column Row (Beer) */}
                <div className={styles.topRow}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.floatInner}>
                      <Image src="/beer-mugs.svg" alt="Beer Mugs" fill className={styles.iconImage} />
                    </div>
                  </div>
                </div>
                {/* Bottom 2-Column Row (Pizza & Taco) */}
                <div className={styles.bottomRow}>
                  <div className={styles.iconWrapper}>
                    <div className={styles.floatInner}>
                      <Image src="/pizza.svg" alt="Pizza" fill className={styles.iconImage} />
                    </div>
                  </div>
                  <div className={styles.iconWrapper}>
                    <div className={styles.floatInner}>
                      <Image src="/taco.svg" alt="Taco" fill className={styles.iconImage} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
});

SeoEnd.displayName = "SeoEnd";
export default SeoEnd;
