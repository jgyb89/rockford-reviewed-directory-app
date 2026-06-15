"use client";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import gsap from "gsap";
import {
  ArrowUp,
  MessageSquare,
  Mail,
  Plus,
} from "lucide-react";
import Link from "next/link";
import styles from "./FabMenu.module.css";

// Custom Facebook Icon
const FacebookIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.fabIcon}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

// Custom TikTok Icon
const TikTokIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.fabIcon}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

// Custom Instagram Icon
const InstagramIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.fabIcon}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

// Custom YouTube Icon
const YoutubeIcon = ({ size = 24 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={styles.fabIcon}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

export default function FabMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const tl = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray(`.${styles.fabItem}`);

      // Initialize items
      gsap.set(items, {
        x: 0,
        y: 0,
        scale: 0.5,
        opacity: 0,
        pointerEvents: "none",
      });

      const spacing = 72; // Distance between each button

      tl.current = gsap.timeline({ paused: true });

      items.forEach((item, i) => {
        // Deal upwards: negative Y offset based on index
        const ty = -((i + 1) * spacing);

        tl.current.to(
          item,
          {
            x: 0,
            y: ty,
            scale: 1,
            opacity: 1,
            pointerEvents: "auto",
            duration: 0.3, // Quick animation
            ease: "back.out(1.4)", // Slight spring effect
          },
          i * 0.04, // Fast stagger
        );
      });

      tl.current.to(
        `.${styles.fabMainIcon}`,
        {
          rotation: 135,
          duration: 0.4,
          ease: "back.out(1.5)",
        },
        0,
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggle = () => {
    if (!tl.current) return;
    if (isOpen) {
      tl.current.timeScale(1.4).reverse();
    } else {
      tl.current.timeScale(1).play();
    }
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    if (isOpen) {
      toggle();
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    closeMenu();
  };

  return (
    <div className={styles.fabWrap} ref={containerRef}>
      {/* DOM order determines stagger order. First item is at the bottom. */}
      <button
        onClick={scrollToTop}
        className={styles.fabItem}
        aria-label="Back to Top"
        title="Back to Top"
      >
        <span className={styles.fabLabel}>Back to Top</span>
        <ArrowUp size={20} className={styles.fabIcon} />
      </button>

      <Link
        href="/contact"
        className={styles.fabItem}
        aria-label="Contact Us"
        title="Contact Us"
        onClick={closeMenu}
      >
        <span className={styles.fabLabel}>Contact Us</span>
        <MessageSquare size={20} className={styles.fabIcon} />
      </Link>

      <Link
        href="/#newsletter"
        className={styles.fabItem}
        aria-label="Newsletter"
        title="Newsletter"
        onClick={closeMenu}
      >
        <span className={styles.fabLabel}>Newsletter</span>
        <Mail size={20} className={styles.fabIcon} />
      </Link>

      <a
        href="https://www.facebook.com/groups/capecoralreviewed/"
        target="_blank"
        rel="noreferrer"
        className={styles.fabItem}
        aria-label="Join Facebook Group"
        title="Join Facebook Group"
        onClick={closeMenu}
      >
        <span className={styles.fabLabel}>Join Facebook Group</span>
        <FacebookIcon size={20} />
      </a>

      <a
        href="https://www.instagram.com/capecoralreviewed/"
        target="_blank"
        rel="noreferrer"
        className={styles.fabItem}
        aria-label="Follow on Instagram"
        title="Follow on Instagram"
        onClick={closeMenu}
      >
        <span className={styles.fabLabel}>Follow on Instagram</span>
        <InstagramIcon size={20} />
      </a>

      <a
        href="https://www.youtube.com/@CapeCoralReviewed"
        target="_blank"
        rel="noreferrer"
        className={styles.fabItem}
        aria-label="Subscribe on YouTube"
        title="Subscribe on YouTube"
        onClick={closeMenu}
      >
        <span className={styles.fabLabel}>Subscribe on YouTube</span>
        <YoutubeIcon size={20} />
      </a>

      <a
        href="https://www.tiktok.com/@capecoralreviewed"
        target="_blank"
        rel="noreferrer"
        className={styles.fabItem}
        aria-label="Follow on TikTok"
        title="Follow on TikTok"
        onClick={closeMenu}
      >
        <span className={styles.fabLabel}>Follow on TikTok</span>
        <TikTokIcon size={20} />
      </a>

      {/* Main Action Button */}
      <button
        onClick={toggle}
        className={styles.fabBtn}
        aria-expanded={isOpen}
        aria-label="Toggle Menu"
      >
        <div className={styles.fabMainIcon}>
          <Plus size={28} />
        </div>
      </button>
    </div>
  );
}

const iconPropTypes = {
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

FacebookIcon.propTypes = iconPropTypes;
TikTokIcon.propTypes = iconPropTypes;
InstagramIcon.propTypes = iconPropTypes;
YoutubeIcon.propTypes = iconPropTypes;
