"use client";

import { useEffect, useRef, forwardRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Store, Users, Mail, ArrowRight } from "lucide-react";
import { getLocalizedUrl } from "@/lib/constants";
import styles from "./SeoCards.module.css";

const SeoCards = forwardRef((props, ref) => {
  const localContainerRef = useRef(null);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  const params = useParams();
  const locale = params?.locale || "en";

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Left Card Slides In
      gsap.fromTo(
        leftCardRef.current,
        { opacity: 0, x: -100, y: 50, rotationY: -10 },
        {
          opacity: 1, x: 0, y: 0, rotationY: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: leftCardRef.current, start: "top 95%" }
        }
      );
      // Right Card Slides In
      gsap.fromTo(
        rightCardRef.current,
        { opacity: 0, x: 100, y: 50, rotationY: 10 },
        {
          opacity: 1, x: 0, y: 0, rotationY: 0, duration: 1.2, ease: "power3.out",
          scrollTrigger: { trigger: rightCardRef.current, start: "top 95%" }
        }
      );
    }, localContainerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref}> {/* Parent uses this ref for background color shifts */}
      <div ref={localContainerRef}> {/* Local GSAP context scope */}
        
        <div className={styles.cardsContainer}>
          <div ref={leftCardRef} className={styles.tideCard}>
            <Store size={48} className={styles.cardIcon} />
            <h3>Are You a Cape Coral Business Owner?</h3>
            <p>Cape Coral Reviewed gives local businesses like yours a place to get discovered by residents and visitors actively looking for recommendations. Build visibility, collect reviews, and connect with a community that wants to support local.</p>
            <Link href={getLocalizedUrl("/register-business", locale)} className={styles.primaryBtn}>
              Submit Your Business <ArrowRight size={18}/>
            </Link>
          </div>

          <div ref={rightCardRef} className={styles.tideCard}>
            <Users size={48} className={styles.cardIcon} />
            <h3>Join the Cape Coral Community</h3>
            <p>Your experience matters. When you leave a review, recommend a business, or share a local favorite, you help other Cape Coral residents make better decisions and help us build a better resource for local business discovery.</p>
            <Link href={getLocalizedUrl("/register", locale)} className={styles.secondaryBtn}>
              Create an Account <ArrowRight size={18}/>
            </Link>
          </div>
        </div>

        <div className={styles.newsletterBlock}>
          <Mail size={40} className="breeze-text" style={{ marginBottom: "1rem" }} />
          <h2 className="breeze-text">Stay Updated on Cape Coral Reviews</h2>
          <p className="breeze-text">Want the latest Cape Coral business reviews, restaurant features, event coverage, and local recommendations delivered straight to your inbox?</p>
          <button className={`${styles.primaryBtn} breeze-text`}>Subscribe for Updates</button>
        </div>

      </div>
    </div>
  );
});

SeoCards.displayName = "SeoCards";
export default SeoCards;
