import { Suspense } from "react";
import { getListings } from "@/lib/api";
import { getDictionary } from "@/lib/dictionaries";
import DirectoryFilterManager from "@/components/directory/DirectoryFilterManager";

export const metadata = {
  title: "Local Business Directory - Cape Coral Reviewed",
  description: "Browse our comprehensive directory of local businesses in Cape Coral, Florida.",
};

export default async function DirectoryIndexPage({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const listings = await getListings();
  const currentUser = null;

  const t = dict?.directory || {};

  return (
    <main
      style={{
        padding: "clamp(1.5rem, 4vw, 3rem) 1rem 0",
        fontFamily: "sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <header style={{ marginBottom: "1rem", textAlign: "center" }}>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: 'clamp(1.75rem, 6vw, 3.5rem)', 
          fontWeight: '800', 
          lineHeight: '1.1',
          marginBottom: '0.5rem',
          color: 'var(--color-text)' 
        }}>
          {t.title || "Business Directory"}
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
          color: '#4a5568', 
          maxWidth: '800px',
          margin: '0 auto 1rem',
          lineHeight: '1.4'
        }}>
          {t.subtitle || "Explore the best local services, restaurants, and shops in Cape Coral."}
        </p>
      </header>

      <Suspense fallback={<div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading listings...</div>}>
        <DirectoryFilterManager listings={listings} currentUser={currentUser} dict={dict} locale={locale} />
      </Suspense>
    </main>
  );
}
