import PropTypes from "prop-types";
import DOMPurify from "isomorphic-dompurify";
import Script from "next/script";
import { getListingBySlug, getListings } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import ListingGallery from "@/components/directory/ListingGallery";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BackButton from "@/components/blog/BackButton";
import ReviewList from "@/components/directory/ReviewList";
import ReviewActionManager from "@/components/directory/ReviewActionManager";
import FavoriteButton from "@/components/directory/FavoriteButton";
import ShareButton from "@/components/directory/ShareButton";
import StarRating from "@/components/ui/StarRating";
import ClaimListing from "@/components/directory/ClaimListing";
import { formatImageUrl } from "@/lib/formatImageUrl";
import { BASE_URL } from "@/lib/constants";
import "./ListingPage.css";

/**
 * Converts standard YouTube/Vimeo URLs into embeddable ones.
 */
const getEmbedUrl = (url) => {
  if (!url) return null;

  // YouTube match (handles watch?v=, youtu.be, and embed/)
  const ytMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;

  // Vimeo match (handles vimeo.com and player.vimeo.com)
  const vimeoMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/,
  );
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;

  return null;
};

/**
 * Detects the social platform from a URL.
 */
const getSocialPlatform = (url) => {
  const lowercaseUrl = url.toLowerCase();
  if (lowercaseUrl.includes("facebook.com")) return "Facebook";
  if (lowercaseUrl.includes("instagram.com")) return "Instagram";
  if (lowercaseUrl.includes("twitter.com") || lowercaseUrl.includes("x.com"))
    return "X / Twitter";
  if (lowercaseUrl.includes("linkedin.com")) return "LinkedIn";
  if (lowercaseUrl.includes("youtube.com")) return "YouTube";
  if (lowercaseUrl.includes("tiktok.com")) return "TikTok";
  return "Social Link";
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing) {
    return {
      title: "Listing Not Found - Cape Coral Reviewed",
    };
  }

  const seoTitle =
    listing.seo?.title || `${listing.title} - Cape Coral Reviewed`;
  const seoDesc =
    listing.seo?.metaDesc ||
    `Find details, reviews, and contact info for ${listing.title} in Cape Coral, FL.`;
  const ogImage = formatImageUrl(listing.seo?.opengraphImage?.sourceUrl);

  return {
    title: seoTitle,
    description: seoDesc,
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      images: ogImage ? [{ url: ogImage }] : [],
    },
  };
}

export async function generateStaticParams() {
  const listings = await getListings();
  const locales = ["en", "es"];
  
  const params = [];
  for (const listing of listings) {
    if (listing.slug) {
      for (const locale of locales) {
        params.push({
          locale,
          slug: listing.slug,
        });
      }
    }
  }
  return params;
}

export default async function DirectoryListingPage({ params }) {
  const { slug, locale } = await params;
  const dict = await getDictionary(locale);
  const listing = await getListingBySlug(slug);
  const currentUser = null;

  if (!listing) {
    return (
      <main style={{ padding: "3rem", textAlign: "center" }}>
        <h1>404: Listing Not Found</h1>
        <p>We couldn&apos;t find the business you&apos;re looking for.</p>
      </main>
    );
  }

  const t = dict?.listing || {};
  const listingdata = listing.listingdata || {};
  const reviewNodes = listing.reviews?.nodes || [];
  const reviewCount = reviewNodes.length;
  const averageRating =
    reviewCount > 0
      ? (
          reviewNodes.reduce(
            (acc, curr) =>
              acc + (Number.parseFloat(curr.reviewFields?.starRating) || 0),
            0,
          ) / reviewCount
        ).toFixed(1)
      : null;

  const initialIsFavorite =
    currentUser?.userData?.favoriteListings?.nodes?.some(
      (n) => n.databaseId === listing.databaseId,
    ) || false;

  const featuredImage = formatImageUrl(listing.featuredImage?.node?.sourceUrl);
  const galleryImages =
    listing.attachedMedia?.nodes?.map((node) => formatImageUrl(node.sourceUrl)) ||
    [];

  const cleanContent = DOMPurify.sanitize(listing.content || "", {
    ALLOWED_TAGS: [
      "p",
      "br",
      "b",
      "i",
      "em",
      "strong",
      "a",
      "ul",
      "ol",
      "li",
      "h3",
      "h4",
    ],
    ALLOWED_ATTR: ["href", "target", "rel"],
  });

  const socialLinks = listingdata.socialUrl
    ? listingdata.socialUrl
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.title,
    image: [featuredImage, ...galleryImages].filter(Boolean),
    address: {
      "@type": "PostalAddress",
      streetAddress: listingdata.addressStreet || "",
      addressLocality: listingdata.addressCity || "Cape Coral",
      addressRegion: listingdata.addressState || "FL",
      postalCode: listingdata.addressZipCode || "",
      addressCountry: "US",
    },
    telephone: listingdata.phoneNumber || "",
    url:
      listingdata.websiteUrl ||
      `${BASE_URL}/listing/${slug}`,
    priceRange: listingdata.priceRange
      ? "$".repeat(listingdata.priceRange)
      : undefined,
    email: listingdata.businessEmail || undefined,
    aggregateRating: averageRating
      ? {
          "@type": "AggregateRating",
          ratingValue: averageRating,
          reviewCount: reviewCount,
        }
      : undefined,
    sameAs: socialLinks.length > 0 ? socialLinks : undefined,
    openingHours: [
      listingdata.hoursMonday && `Mo ${listingdata.hoursMonday}`,
      listingdata.hoursTuesday && `Tu ${listingdata.hoursTuesday}`,
      listingdata.hoursWednesday && `We ${listingdata.hoursWednesday}`,
      listingdata.hoursThursday && `Th ${listingdata.hoursThursday}`,
      listingdata.hoursFriday && `Fr ${listingdata.hoursFriday}`,
      listingdata.hoursSaturday && `Sa ${listingdata.hoursSaturday}`,
      listingdata.hoursSunday && `Su ${listingdata.hoursSunday}`,
    ].filter(Boolean)
  };

  const dayLabels = t.days || {};
  const hours = [
    { day: dayLabels.monday || "Monday", time: listingdata.hoursMonday },
    { day: dayLabels.tuesday || "Tuesday", time: listingdata.hoursTuesday },
    {
      day: dayLabels.wednesday || "Wednesday",
      time: listingdata.hoursWednesday,
    },
    { day: dayLabels.thursday || "Thursday", time: listingdata.hoursThursday },
    { day: dayLabels.friday || "Friday", time: listingdata.hoursFriday },
    { day: dayLabels.saturday || "Saturday", time: listingdata.hoursSaturday },
    { day: dayLabels.sunday || "Sunday", time: listingdata.hoursSunday },
  ];

  // Process Video and Social Links
  const videoEmbedUrl = getEmbedUrl(listingdata.videoUrl);

  return (
    <div className="listing-layout">
      <Script
        id="listing-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="listing-main">
        <div className="listing-top-actions">
          <BackButton label={t.goBack || "Go Back"} />
          <div className="listing-action-group">
            <FavoriteButton
              listingId={listing.databaseId}
              initialIsFavorite={initialIsFavorite}
              currentUser={currentUser}
              label={t.favorite || "Favorite"}
            />
            <ShareButton
              title={listing.title}
              text={`Check out ${listing.title} on Cape Coral Reviewed!`}
            />
            <button className="listing-action-btn">
              <span className="material-symbols-outlined">flag</span>{" "}
              <span className="listing-action-btn__text">
                {t.report || "Report"}
              </span>
            </button>
          </div>
        </div>

        <ListingGallery
          featuredImage={featuredImage}
          galleryImages={galleryImages}
        />

        <header className="listing-header">
          <h1 className="listing-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {listing.title}
          </h1>
          <div className="listing-header__meta">
            <div className="listing-header__rating">
              <StarRating rating={averageRating} />
              <span style={{ marginLeft: "0.5rem" }}>
                {averageRating || "0.0"} ({reviewCount} reviews)
              </span>
            </div>
            <div className="listing-header__categories">
              {listing.directoryTypes?.nodes?.map((cat) => (
                <span key={cat.slug} className="listing-category-tag">
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        </header>

        <section className="listing-card">
          <h2 className="listing-card__title">
            <span className="material-symbols-outlined">info</span>{" "}
            Business Info
          </h2>
          <div className="listing-card__item">
            <span className="material-symbols-outlined listing-card__icon">
              location_on
            </span>{" "}
            <span className="listing-card__text">
              {listingdata.addressStreet}, {listingdata.addressCity},{" "}
              {listingdata.addressState} {listingdata.addressZipCode}
            </span>
          </div>
          <div className="listing-card__item">
            <span className="material-symbols-outlined listing-card__icon">
              call
            </span>{" "}
            <span className="listing-card__text">{listingdata.phoneNumber}</span>
          </div>
          {listingdata.websiteUrl && (
            <div className="listing-card__item">
              <span className="material-symbols-outlined listing-card__icon">
                language
              </span>{" "}
              <a
                href={listingdata.websiteUrl}
                className="listing-card__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Website
              </a>
            </div>
          )}

          {/* Integrated Social Links */}
          {socialLinks.length > 0 && (
            <div
              className="listing-card__social"
              style={{
                marginTop: "1.5rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  share_reviews
                </span>{" "}
                Connect with us
              </h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                {socialLinks.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="listing-card__link"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.1rem" }}
                    >
                      link
                    </span>{" "}
                    {getSocialPlatform(url)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="listing-card">
          <h2 className="listing-card__title">
            <span className="material-symbols-outlined">description</span>{" "}
            {t.aboutBusiness || "About the Business"}
          </h2>
          <div
            className="listing-card__text"
            style={{ whiteSpace: "pre-wrap" }}
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />
        </section>

        {/* Video Section */}
        {videoEmbedUrl && (
          <section className="listing-card">
            <h2 className="listing-card__title">
              <span className="material-symbols-outlined">play_circle</span>{" "}
              Featured Video
            </h2>
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: "8px",
              }}
            >
              <iframe
                src={videoEmbedUrl}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Featured Business Video"
              />
            </div>
          </section>
        )}

        <section id="reviews" className="listing-card">
          <div className="reviews-section-header">
            <h3 className="review-list__header">User Reviews ({reviewCount})</h3>
            <ReviewActionManager
              listingId={listing.databaseId}
              listingTitle={listing.title}
              currentUser={currentUser}
              dict={dict}
            />
          </div>
          <ReviewList 
            reviews={listing.reviews} 
            noReviewsYet={t.noReviewsYet}
            currentUser={currentUser}
          />
        </section>
      </main>

      <aside className="listing-sidebar">
        <ClaimListing
          listingId={listing.databaseId}
          listingTitle={listing.title}
          isClaimed={listing.listingdata?.isClaimed === "true"}
          dict={dict}
        />

        <section className="listing-card">
          <h2 className="listing-card__title">
            <span className="material-symbols-outlined">schedule</span>{" "}
            {t.businessHours || "Business Hours"}
          </h2>
          {hours.map((h) => (
            <div
              key={h.day}
              className="listing-card__item"
              style={{ justifyContent: "space-between" }}
            >
              <span style={{ fontWeight: 600 }}>{h.day}</span>
              <span>{h.time || (t.closed || "Closed")}</span>
            </div>
          ))}
        </section>
        <BlogSidebar locale={locale} />
      </aside>
    </div>
  );
}

DirectoryListingPage.propTypes = {
  params: PropTypes.object.isRequired,
};
