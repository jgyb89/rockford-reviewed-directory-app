import PropTypes from "prop-types";
import Link from "next/link";
import { getListingsByCategory } from "@/lib/api";
import { getViewer } from "@/lib/auth";
import { getDictionary } from "@/lib/dictionaries";
import DirectoryFilterManager from "@/components/directory/DirectoryFilterManager";

export async function generateMetadata({ params }) {
  const { directoryType, categorySlug } = await params;
  const capitalizedType = directoryType.charAt(0).toUpperCase() + directoryType.slice(1).replace(/-/g, ' ');
  const capitalizedCategory = categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1).replace(/-/g, ' ');
  
  return {
    title: `${capitalizedCategory} in ${capitalizedType} - Cape Coral Reviewed`,
    description: `Browse the best ${capitalizedCategory} in ${capitalizedType} in Cape Coral, Florida. Read reviews and find contact information.`,
  };
}

export default async function CategoryPage({ params }) {
  const { locale, directoryType, categorySlug } = await params;
  const dict = await getDictionary(locale);
  const listings = await getListingsByCategory(categorySlug, directoryType);
  const currentUser = await getViewer();

  // Derive category name from the first listing if available, or use the slug
  const categoryName = listings[0]?.ccrlistingcategories?.nodes?.find(n => n.slug === categorySlug)?.name || categorySlug.replace(/-/g, ' ');

  return (
    <main style={{ padding: "clamp(1.5rem, 4vw, 3rem) 1rem 0", maxWidth: "1200px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <header style={{ marginBottom: "1rem" }}>
        <Link href={`/${locale}/directory/${directoryType}`} style={{ color: "#0070f3", textDecoration: "none", fontSize: "0.9rem" }}>← Back to {directoryType.replace(/-/g, ' ')}</Link>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: 'clamp(1.75rem, 6vw, 3.5rem)', 
          fontWeight: '800', 
          lineHeight: '1.1',
          marginTop: '1rem',
          marginBottom: '0.5rem',
          color: 'var(--color-text)',
          textTransform: 'capitalize'
        }}>
          Best {categoryName} in Cape Coral
        </h1>
      </header>

      <DirectoryFilterManager listings={listings} currentUser={currentUser} dict={dict} locale={locale} />
    </main>
  );
}

CategoryPage.propTypes = {
  params: PropTypes.object.isRequired,
};
