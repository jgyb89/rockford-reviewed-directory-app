"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUp, MessageSquare, Mail, Plus } from "lucide-react";
import Link from "next/link";
import styles from "./FabMenu.module.css";

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
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
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
        scale: 0,
        opacity: 0,
        pointerEvents: "none",
      });

      const radius = 115;
      const startAngle = 180;
      const endAngle = 270;
      const angleStep = (endAngle - startAngle) / (items.length - 1);

      tl.current = gsap.timeline({ paused: true });

      items.forEach((item, i) => {
        const angle = (startAngle + angleStep * i) * (Math.PI / 180);
        const tx = Math.cos(angle) * radius;
        const ty = Math.sin(angle) * radius;

        tl.current.to(
          item,
          {
            x: tx,
            y: ty,
            scale: 1,
            opacity: 1,
            pointerEvents: "auto",
            duration: 1.0,
            ease: "elastic.out(1, 0.5)",
          },
          i * 0.08,
        );
      });

      tl.current.to(
        `.${styles.fabMainIcon}`,
        {
          rotation: 135,
          duration: 0.6,
          ease: "back.out(1.7)",
        },
        0,
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const toggle = () => {
    if (!tl.current) return;
    if (isOpen) {
      tl.current.timeScale(1.2).reverse();
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
      <a
        href="https://www.facebook.com/groups/capecoralreviewed/"
        target="_blank"
        rel="noreferrer"
        className={styles.fabItem}
        aria-label="Join Facebook Group"
        title="Join Facebook Group"
        onClick={closeMenu}
      >
        <FacebookIcon size={20} />
      </a>
      <Link
        href="/#newsletter"
        className={styles.fabItem}
        aria-label="Newsletter"
        title="Newsletter"
        onClick={closeMenu}
      >
        <Mail size={20} />
      </Link>
      <Link
        href="/contact"
        className={styles.fabItem}
        aria-label="Contact Us"
        title="Contact Us"
        onClick={closeMenu}
      >
        <MessageSquare size={20} />
      </Link>
      <button
        onClick={scrollToTop}
        className={styles.fabItem}
        aria-label="Back to Top"
        title="Back to Top"
      >
        <ArrowUp size={20} />
      </button>

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
