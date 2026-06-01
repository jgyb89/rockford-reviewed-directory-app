import PropTypes from "prop-types";
import { getListings } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import HorizontalListingFeed from "@/components/home/HorizontalListingFeed";
import HomepageInfo from "@/components/home/HomepageInfo";
import SunsetTransition from "@/components/home/SunsetTransition";
import BeachySeoStory from "@/components/home/BeachySeoStory";
import SeoCards from "@/components/home/SeoCards";
import { BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata = {
  title: "Cape Coral Reviewed - Local Business Directory",
  description:
    "Looking for the best and most popular Cape Coral businesses, restaurants, services, and local spots? Cape Coral Reviewed helps residents, visitors, and business owners like you connect through real reviews, local recommendations, honest business spotlights, and true community-driven guides.",
  openGraph: {
    title: "Cape Coral Reviewed",
    description:
      "Looking for the best and most popular Cape Coral businesses, restaurants, services, and local spots? Cape Coral Reviewed helps residents, visitors, and business owners like you connect through real reviews, local recommendations, honest business spotlights, and true community-driven guides.",
    url: BASE_URL,
    siteName: "Cape Coral Reviewed",
    locale: "en_US",
    type: "website",
  },
};

export default async function HomePage({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const listings = await getListings();
  const currentUser = null;

  // Strict filter: only listings where the author is featured
  const featuredListings = listings.filter(
    (listing) => listing.author?.node?.userData?.isFeaturedUser === true,
  );

  const popularNearYou = listings.slice(0, 5);
  const feedListings = listings;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cape Coral Reviewed",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <main className={styles.main}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <HeroSlideshow featuredListings={featuredListings} locale={locale} />

      {/* Main Content Layout - REPLACED WITH HORIZONTAL ROW */}
      <div className={styles.container}>
        <HorizontalListingFeed
          listings={feedListings}
          currentUser={currentUser}
          dict={dict.home}
          locale={locale}
        />
      </div>

      {/* Homepage Info Section */}
      <HomepageInfo />

      {/* Coastal Sunrise GSAP Journey & SEO Story */}
      <BeachySeoStory />

      <section style={{ backgroundColor: "#ffffff", padding: "4rem 0", overflowX: "hidden" }}>
        <div className={styles.container}>
          <SeoCards />
        </div>
      </section>

      {/* Sunset Animation Transition */}
      <SunsetTransition />
    </main>
  );
}

HomePage.propTypes = {
  params: PropTypes.object.isRequired,
};
