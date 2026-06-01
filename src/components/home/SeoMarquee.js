"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import styles from "./SeoMarquee.module.css";

// Card Images
import ItalianRestaurant from "../../../public/italian-restaurant.webp";
import MugsCheering from "../../../public/mugs-of-beer.webp";
import lawnMowing from "../../../public/lawn-mowing.webp";
import BoatRiding from "../../../public/boat-riding-on-wave.webp";

export default function SeoMarquee() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.to(trackRef.current, {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const marqueeCards = [
    { img: ItalianRestaurant },
    { img: MugsCheering },
    { img: lawnMowing },
    { img: BoatRiding },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
    { img: null },
  ];

  return (
    <div ref={containerRef} className={styles.marqueeContainer}>
      <h3 className={`breeze-text ${styles.marqueeTitle}`}>
        Explore Local Reviews & Business Spotlights
      </h3>
      <div ref={trackRef} className={styles.marqueeTrack}>
        {marqueeCards.map((card, i) => (
          <div key={i} className={styles.mockListingCard}>
            <div className={styles.cardImageStub}>
              {card.img && (
                <Image
                  src={card.img}
                  alt="Featured spot thumbnail"
                  fill
                  sizes="320px"
                  className={styles.cardImage}
                  priority={i < 4}
                />
              )}
            </div>
            <div className={styles.cardContentContainer}>
              <div className={styles.cardTitleLineStub}></div>
              <div className={styles.starsRowStub}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className={styles.miniStar}>
                    ★
                  </span>
                ))}
              </div>
              <div className={styles.cardBodyLineStub}></div>
              <div className={styles.cardBodyLineStubShort}></div>
            </div>
          </div>
        ))}
      </div>
      <p className={`breeze-text ${styles.marqueeDesc}`}>
        Every review and spotlight is created to help people make better local
        choices and support the businesses that keep Cape Coral moving and
        growing.
      </p>
    </div>
  );
}
