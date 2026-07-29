'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./BlogSEO.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function BlogSEO() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const breezeElements = gsap.utils.toArray(".breeze-text");

      breezeElements.forEach((el, index) => {
        const rot = index % 2 === 0 ? 2 : -2; 
        gsap.fromTo(
          el,
          { opacity: 0, y: 40, rotationZ: rot },
          {
            opacity: 1,
            y: 0,
            rotationZ: 0,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
            },
          },
        );
      });

      // SVG lines animation
      const paths = gsap.utils.toArray(".animated-line");
      paths.forEach((path, i) => {
        const length = path.getTotalLength() || 100;
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });

        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "power2.inOut",
          duration: 2.5,
          delay: i * 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          },
        });
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className={styles.section}>
      {/* SVG Animated Lines */}
      <svg
        className={styles.svgLines}
        viewBox="0 0 140 10000"
        preserveAspectRatio="xMinYMin slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path className="animated-line" d="M 105 0 L 105 10000" stroke="#e57007" strokeWidth="32" fill="none" strokeLinecap="round" />
        <path className="animated-line" d="M 75 0 L 75 10000" stroke="#ff8c00" strokeWidth="32" fill="none" strokeLinecap="round" />
        <path className="animated-line" d="M 45 0 L 45 10000" stroke="#ffd700" strokeWidth="32" fill="none" strokeLinecap="round" />
        <path className="animated-line" d="M 15 0 L 15 10000" stroke="#ffffff" strokeWidth="32" fill="none" strokeLinecap="round" />
      </svg>

      <div className={styles.container}>
        
        {/* Block 1 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Your Source for Rockford, Michigan News, Reviews, and Local Recommendations</h2>
          <p className="breeze-text">There is always something new to discover in Rockford, Michigan. A restaurant opens its doors. A familiar local business introduces a new service. A seasonal tradition returns downtown. A hidden gem begins earning the attention it deserves.</p>
          <p className="breeze-text">The News & Reviews section of Rockford Reviewed helps residents and visitors keep up with the businesses, places, people, and experiences shaping the Rockford community.</p>
          <p className="breeze-text">Here, you can explore Rockford business spotlights, local restaurant reviews, community updates, helpful guides, and recommendations designed to make it easier to decide where to eat, shop, visit, and find dependable local services.</p>
          <p className="breeze-text">Whether you have lived in the area for years or are planning your first trip to Rockford, this page gives you a local starting point.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 2 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Discover More of Rockford</h2>
          <p className="breeze-text">Rockford offers the convenience of a growing community while maintaining the welcoming character people value in a smaller Michigan town. Downtown shops and restaurants, the Rogue River, local trails, community gatherings, and independently owned businesses all contribute to the experience of living in and visiting the area.</p>
          <p className="breeze-text">Our local guides help you explore those experiences more fully.</p>
          <p className="breeze-text">You may find articles covering new restaurants, longtime community favorites, seasonal activities, home service providers, shopping destinations, outdoor recreation, and things to do around Rockford. We also highlight businesses and organizations whose work may be useful or interesting to local residents.</p>
          <p className="breeze-text">Instead of searching through scattered posts and outdated recommendations, you can use Rockford Reviewed to find local information collected with the Rockford community in mind.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 3 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Rockford Reviews That Help You Make Better Local Decisions</h2>
          <p className="breeze-text">Choosing a restaurant, contractor, shop, wellness provider, or professional service often begins with a simple question: Where should I go?</p>
          <p className="breeze-text">Rockford reviews can help answer that question.</p>
          <p className="breeze-text">Our review content is intended to give readers a clearer understanding of what a local business offers, who it may be a good fit for, and what makes it stand out. We look beyond a name and address to explore the experience, products, services, atmosphere, and people behind Rockford businesses.</p>
          <p className="breeze-text">That could mean introducing you to a new place for lunch, helping you discover a local shop, or giving you another option when you need a dependable service provider.</p>
          <p className="breeze-text">No single recommendation will be right for everyone. By sharing useful details and local perspectives, however, Rockford Reviewed can help you narrow your choices and make more confident decisions.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 4 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Celebrating Rockford Businesses</h2>
          <p className="breeze-text">Local businesses do more than sell products or provide services. They create jobs, support community activities, serve their neighbors, and give Rockford much of its individual character.</p>
          <p className="breeze-text">Our Rockford business spotlights help tell their stories.</p>
          <p className="breeze-text">These features may introduce readers to new businesses, recognize established local favorites, explain specialized services, or take a closer look at the people behind a Rockford company. They also give business owners an opportunity to share what they do with residents who are actively looking for local recommendations.</p>
          <p className="breeze-text">When a good local business becomes easier to find, both the business and the community benefit.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 5 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Helpful Guides for Residents and Visitors</h2>
          <p className="breeze-text">Rockford Reviewed is built for anyone who wants to experience more of the area.</p>
          <p className="breeze-text">Residents can use our articles to discover businesses they may have overlooked, compare local options, and keep up with changes around town.</p>
          <p className="breeze-text">Visitors can find ideas for dining, shopping, recreation, and spending time near downtown Rockford.</p>
          <p className="breeze-text">Our local guides may help you plan a day out, find a place to meet friends, explore the area with your family, or discover services that make everyday life a little easier.</p>
          <p className="breeze-text">From restaurants and retailers to contractors, health and wellness businesses, events, and outdoor activities, Rockford Reviewed brings local information together in one convenient place.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 6 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Be Part of the Rockford Conversation</h2>
          <p className="breeze-text">A useful local resource grows through community participation.</p>
          <p className="breeze-text">When Rockford residents share recommendations, leave thoughtful reviews, or tell us about a business worth featuring, they help other people discover more of the community. Your experience with a local restaurant, shop, service provider, or event could help another resident decide what to try next.</p>
          <p className="breeze-text">Business owners can also submit their companies to the Rockford business directory and share news, updates, or stories that may be valuable to the community.</p>
          <p className="breeze-text">Explore the latest Rockford news and reviews, support businesses doing good work, and help us continue building a dependable resource for Rockford, Michigan.</p>
        </div>

      </div>
    </section>
  );
}
