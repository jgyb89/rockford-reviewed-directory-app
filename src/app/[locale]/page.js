import PropTypes from "prop-types";
import { getListings } from "@/lib/api";
import { getViewer } from "@/lib/auth";
import { getDictionary } from "@/lib/dictionaries";
import HeroSlideshow from "@/components/home/HeroSlideshow";
import TabbedListingFeed from "@/components/home/TabbedListingFeed";
import HomeSidebar from "@/components/home/HomeSidebar";

export const metadata = {
  title: "Cape Coral Reviewed - Local Business Directory",
  description: "Discover the best local businesses, restaurants, and services in Cape Coral, Florida.",
  openGraph: {
    title: "Cape Coral Reviewed",
    description: "Discover the best local businesses, restaurants, and services in Cape Coral, Florida.",
    url: "https://capecoralreviewed.com",
    siteName: "Cape Coral Reviewed",
    locale: "en_US",
    type: "website",
  },
};

export default async function HomePage({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const listings = await getListings();
  const currentUser = await getViewer();

  // Strict filter: only listings where the author is featured
  const featuredListings = listings.filter(
    (listing) => listing.author?.node?.userData?.isFeaturedUser === true
  );
  
  const popularNearYou = listings.slice(0, 5);
  const feedListings = listings;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Cape Coral Reviewed",
    url: "https://capecoralreviewed.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://capecoralreviewed.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main style={{ backgroundColor: "#fdfdfd", minHeight: "100vh" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero Section */}
      <HeroSlideshow featuredListings={featuredListings} locale={locale} />

      {/* Main Content Layout */}
      <div
        style={{
          maxWidth: "1600px",
          margin: "40px auto",
          padding: "0 2vw",
        }}
      >
        <div className="home-layout-grid">
          {/* Sidebar (Left on Desktop, Bottom on Mobile) */}
          <div className="home-sidebar-wrapper">
            <HomeSidebar
              featuredBusinesses={featuredListings}
              popularNearYou={popularNearYou}
              dict={dict.home}
              locale={locale}
            />
          </div>

          {/* Main Feed (Right on Desktop, Top on Mobile) */}
          <div className="home-feed-wrapper">
            <TabbedListingFeed
              initialListings={feedListings}
              currentUser={currentUser}
              dict={dict.home}
              locale={locale}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

HomePage.propTypes = {
  params: PropTypes.object.isRequired,
};
