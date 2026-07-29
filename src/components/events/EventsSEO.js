'use client';

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./EventsSEO.module.css";

gsap.registerPlugin(ScrollTrigger);

export default function EventsSEO() {
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
          <h2 className="breeze-text">Find Events and Things to Do in Rockford, Michigan</h2>
          <p className="breeze-text">Looking for something to do in Rockford?</p>
          <p className="breeze-text">The Rockford Reviewed Events page helps residents and visitors discover upcoming festivals, live music, family activities, food and drink events, educational programs, business gatherings, and other community happenings around Rockford, Michigan.</p>
          <p className="breeze-text">Whether you are planning your weekend, looking for an activity with the kids, organizing a night out, or searching for a way to become more involved locally, our Rockford events calendar gives you a convenient place to begin.</p>
          <p className="breeze-text">Browse upcoming events, explore different categories, and find more reasons to enjoy the Rockford community.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 2 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">What Is Happening in Rockford?</h2>
          <p className="breeze-text">Rockford may have a close-knit atmosphere, but that does not mean there is nothing happening.</p>
          <p className="breeze-text">Throughout the year, the community comes together for festivals, markets, outdoor entertainment, seasonal celebrations, local fundraisers, workshops, performances, and activities hosted by Rockford businesses and organizations.</p>
          <p className="breeze-text">Some events bring people into the heart of downtown. Others take place in local parks, restaurants, shops, schools, churches, community spaces, and outdoor recreation areas. From a relaxed afternoon near the Rogue River to a busy festival weekend, Rockford offers activities for many different interests and age groups.</p>
          <p className="breeze-text">Rockford Reviewed makes these opportunities easier to find by bringing local event information together in one searchable location.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 3 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Rockford Events for Every Season</h2>
          <p className="breeze-text">Each season offers a different way to experience Rockford, Michigan.</p>
          <p className="breeze-text">Warmer months bring outdoor concerts, community markets, festivals, recreation, and opportunities to enjoy the river, parks, and trails. Fall offers colorful scenery, seasonal shopping, harvest activities, and community traditions. Winter brings holiday celebrations, festive downtown experiences, and indoor activities. Spring marks the return of outdoor gatherings and another full calendar of local events.</p>
          <p className="breeze-text">Annual Rockford traditions such as the Start of Summer Celebration, Harvest Fest, the Rockford Farm Market, and outdoor music programs give residents and visitors something to anticipate throughout the year.</p>
          <p className="breeze-text">Alongside these larger traditions, you can also find smaller business events, classes, performances, meetups, sales, workshops, and community programs happening throughout the area.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 4 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Plan a Day or Weekend in Rockford</h2>
          <p className="breeze-text">An event can be the centerpiece of an entire day in Rockford.</p>
          <p className="breeze-text">You might attend a downtown festival before visiting a local restaurant, browse a market and then walk along the Rogue River, or pair an evening performance with drinks or dinner nearby. Families can look for children’s activities and community celebrations, while visitors can use the calendar to find out what will be happening during their stay.</p>
          <p className="breeze-text">Rockford’s combination of local businesses, dining, natural scenery, and community events makes it easy to build a day around more than one experience.</p>
          <p className="breeze-text">Before attending an event, review the organizer’s information for the latest details about schedules, admission, registration, parking, weather policies, and possible changes.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 5 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Family Activities, Entertainment, and Community Gatherings</h2>
          <p className="breeze-text">The Rockford events calendar is designed to include a wide range of local activities.</p>
          <p className="breeze-text">Depending on the season, listings may include:</p>
          <ul className={styles.list}>
            <li className="breeze-text">Festivals and downtown celebrations</li>
            <li className="breeze-text">Live music and performances</li>
            <li className="breeze-text">Farmers markets and shopping events</li>
            <li className="breeze-text">Food and drink experiences</li>
            <li className="breeze-text">Family-friendly activities</li>
            <li className="breeze-text">Classes, workshops, and educational programs</li>
            <li className="breeze-text">Fundraisers and nonprofit events</li>
            <li className="breeze-text">Business networking opportunities</li>
            <li className="breeze-text">Fitness and outdoor recreation</li>
            <li className="breeze-text">Holiday and seasonal gatherings</li>
          </ul>
          <p className="breeze-text">Our goal is to help people find activities that match their schedules and interests without having to search through multiple websites and social media feeds.</p>
          <p className="breeze-text">Whether you are looking for free things to do in Rockford, a ticketed performance, a community tradition, or a local business event, check back regularly to see what has been added.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 6 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Promote an Event in Rockford, Michigan</h2>
          <p className="breeze-text">Hosting an upcoming event?</p>
          <p className="breeze-text">Rockford Reviewed gives local businesses, organizations, performers, event planners, nonprofits, and community groups another way to reach people in the Rockford area.</p>
          <p className="breeze-text">Submitting your event can help residents learn what is happening, understand what to expect, and find the information they need to participate. Include a clear event name, date, time, location, description, cost, registration information, and any other details attendees should know.</p>
          <p className="breeze-text">Events may include grand openings, live entertainment, classes, markets, fundraisers, special menus, community programs, seasonal celebrations, and other activities open to local residents or visitors.</p>
          <p className="breeze-text">The earlier you submit an event, the more time people have to discover it and make plans.</p>
        </div>

        <div className={styles.spacer}></div>

        {/* Block 7 */}
        <div className={styles.textBlock}>
          <h2 className="breeze-text">Stay Connected to the Rockford Community</h2>
          <p className="breeze-text">Local events give people a reason to gather, explore, and support the community around them.</p>
          <p className="breeze-text">They introduce residents to local organizations, bring customers to Rockford businesses, create shared traditions, and offer visitors another way to experience the city. Even a small event can help people form new connections and discover something they might otherwise have missed.</p>
          <p className="breeze-text">Use Rockford Reviewed to explore upcoming Rockford events, share activities with friends and family, and find your next reason to get out and enjoy the community.</p>
          <p className="breeze-text">Check the calendar regularly, submit an upcoming event, and discover more things to do in Rockford, Michigan.</p>
        </div>

      </div>
    </section>
  );
}
