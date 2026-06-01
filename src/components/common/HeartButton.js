'use client';

import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import gsap from 'gsap';
import styles from './HeartButton.module.css';

export default function HeartButton({ initialLiked = false, onToggle }) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const heartRef = useRef(null);

  const handleMouseEnter = () => {
    if (!heartRef.current) return;
    gsap.to(heartRef.current, {
      rotation: 30,
      scale: 1.3,
      duration: 1,
      overwrite: "auto",
      transformOrigin: "center 60%",
      ease: "back.out(3)"
    });
  };

  const handleMouseLeave = () => {
    if (!heartRef.current) return;
    gsap.to(heartRef.current, {
      rotation: 0,
      scale: 1,
      duration: 1,
      overwrite: "auto",
      transformOrigin: "center 60%",
      ease: "back.out(3)"
    });
  };

  const handleClick = (e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a Link
    e.stopPropagation(); // Prevent triggering parent card clicks

    const newState = !isLiked;
    setIsLiked(newState);

    if (onToggle) {
      onToggle(newState);
    }
  };

  return (
    <button 
      type="button" 
      className={`${styles['heart-btn']} ${isLiked ? styles.active : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
    >
      <span ref={heartRef} className={`material-symbols-outlined ${styles['heart-icon']}`}>
        favorite
      </span>
    </button>
  );
}

HeartButton.propTypes = {
  initialLiked: PropTypes.bool,
  onToggle: PropTypes.func,
};
