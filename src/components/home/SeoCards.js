"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Store, Users, ArrowRight } from "lucide-react";
import { getLocalizedUrl } from "@/lib/constants";
import styles from "./SeoCards.module.css";

export default function SeoCards() {
  const containerRef = useRef(null);
  const params = useParams();
  const locale = params?.locale || "en";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.from(containerRef.current, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles.cardsContainer}>
      <div className={styles.tideCard}>
        <Store size={48} className={styles.cardIcon} />
        <h3>Are You a Rockford Business Owner?</h3>
        <p>
          Rockford Reviewed gives your business a place to be discovered by people actively looking for Rockford, Michigan local businesses. Whether you run a restaurant, home service company, salon, boutique, gym, professional service, event venue, local brand (or virtually anything else), your listing can help customers learn who you are, what you offer, and why your business is worth checking out. Get listed, collect reviews, share updates, and connect with a community that wants to support local businesses.
        </p>
        <Link
          href={getLocalizedUrl("/register-business", locale)}
          className={styles.primaryBtn}
        >
          Submit Your Rockford Business <ArrowRight size={18} />
        </Link>
      </div>

      <div className={styles.tideCard}>
        <Users size={48} className={styles.cardIcon} />
        <h3>Share Your Rockford Recommendations</h3>
        <p>
          Your experience can help someone else make a better local decision. When you leave a review, recommend a business, or share a favorite spot, you help build a stronger resource for everyone in Rockford. The more the community participates, the easier it becomes for residents and visitors to find trusted businesses, hidden gems, and local favorites. Support local. Review local. Help others discover Rockford.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link
            href={getLocalizedUrl("/register", locale)}
            className={styles.secondaryBtn}
          >
            Create an Account <ArrowRight size={18} />
          </Link>
          <Link
            href={getLocalizedUrl("/recommend", locale)}
            className={styles.secondaryBtn}
          >
            Recommend a Business <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}
