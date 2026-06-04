"use client";

import React from "react";
import PropTypes from "prop-types";
import Image from "next/image";
import Link from "next/link";
import { getLocalizedUrl } from "@/lib/constants";
import styles from "./EventCard.module.css";
import { formatImageUrl } from "@/lib/formatImageUrl";

export default function EventCard({ event, locale = 'en' }) {
  if (!event) return null;

  const { title, databaseId, slug, content, featuredImage, eventDetails, eventCategories } = event;
  
  const eventUrl = getLocalizedUrl(`/events/${slug}`, locale);

  const imageUrl = formatImageUrl(featuredImage?.node?.sourceUrl);
  const imageAlt = featuredImage?.node?.altText || title;

  let startDate = eventDetails?.startDateTime ? new Date(eventDetails.startDateTime).toLocaleDateString() : "";
  const endDate = eventDetails?.endDateTime ? new Date(eventDetails.endDateTime).toLocaleDateString() : "";
  if (endDate && startDate !== endDate) {
    startDate = `${startDate} - ${endDate}`;
  }
  const venueName = eventDetails?.venueName || "TBA";
  const price = eventDetails?.price || "Free";
  
  const descriptionSnippet = content ? (content.slice(0, 1000).replace(/<[^<>]+>/g, '').substring(0, 100) + (content.length > 100 ? '...' : '')) : '';

  return (
    <div className={styles.eventCard}>
      <div className={styles.imageWrapper}>
        <Link href={eventUrl} className={styles.imageLink} aria-label={title}>
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={styles.image}
            priority={false}
          />
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.dateBlock}>{startDate}</div>
        
        {eventCategories?.nodes?.length > 0 && (
          <div className={styles.categories}>
            {eventCategories.nodes.map(cat => (
              <span key={cat.slug} className={styles.categoryPill}>{cat.name}</span>
            ))}
          </div>
        )}

        <Link href={eventUrl} className={styles.headerLink}>
          <h3 className={styles.title}>{title}</h3>
        </Link>
        
        {descriptionSnippet && (
          <p className={styles.description}>{descriptionSnippet}</p>
        )}

        <div className={styles.venueBlock}>
          <span className="material-symbols-outlined" style={{ fontSize: "16px", verticalAlign: "text-bottom", marginRight: "4px" }}>
            location_on
          </span>
          {venueName}
        </div>

        <div className={styles.footer}>
          <span>{price}</span>
        </div>
      </div>
    </div>
  );
}

EventCard.propTypes = {
  event: PropTypes.shape({
    databaseId: PropTypes.number,
    slug: PropTypes.string,
    title: PropTypes.string,
    content: PropTypes.string,
    featuredImage: PropTypes.shape({
      node: PropTypes.shape({
        sourceUrl: PropTypes.string,
        altText: PropTypes.string,
      }),
    }),
    eventDetails: PropTypes.shape({
      startDateTime: PropTypes.string,
      endDateTime: PropTypes.string,
      venueName: PropTypes.string,
      price: PropTypes.string,
    }),
    eventCategories: PropTypes.shape({
      nodes: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        slug: PropTypes.string
      }))
    })
  }).isRequired,
  locale: PropTypes.string,
};
