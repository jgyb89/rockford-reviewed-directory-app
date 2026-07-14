import Image from "next/image";
import Link from "next/link";
import { getSidebarListings } from "@/lib/actions";
import { formatImageUrl } from "@/lib/formatImageUrl";
import { getLocalizedUrl } from "@/lib/constants";
import PropTypes from 'prop-types';

export default async function BlogSidebar({ locale = "en" }) {
  const listings = await getSidebarListings();

  return (
    <aside className="blog-sidebar">
      <div className="sidebar-widget">
        <h3 className="sidebar-widget__title" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>
          Featured Listings
        </h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {listings.map((listing) => {
            const imageUrl = formatImageUrl(listing.featuredImage?.node?.sourceUrl);
            const categoryName = listing.directoryTypes?.nodes?.[0]?.name || '';
            
            // Calculate Average Rating safely
            const reviews = listing.reviews?.nodes || [];
            const reviewCount = reviews.length;
            const avgRating = reviewCount > 0 
              ? (reviews.reduce((sum, r) => sum + (Number.parseFloat(r.reviewFields?.starRating) || 0), 0) / reviewCount).toFixed(1) 
              : "0.0";

            return (
              <Link 
                href={getLocalizedUrl(`/listing/${listing.slug}`, locale)} 
                key={listing.databaseId || listing.slug} 
                style={{ display: 'flex', gap: '1rem', textDecoration: 'none', color: 'inherit', marginBottom: '1.5rem', alignItems: 'center' }}
              >
                {/* Constrained Thumbnail Image Wrapper (Fixes the fill bug) */}
                <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                  <Image 
                    src={imageUrl} 
                    fill 
                    style={{ objectFit: 'cover' }} 
                    alt={listing.title} 
                    sizes="80px"
                  />
                </div>
                
                {/* Info Column */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.3rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#1e293b', lineHeight: '1.2' }}>
                    {listing.title}
                  </h4>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', color: '#64748b' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#e57007', fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span style={{ fontWeight: '700', color: '#1e293b' }}>{avgRating}</span>
                    <span>({reviewCount})</span>
                  </div>
                  
                  {categoryName && (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {categoryName}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

BlogSidebar.propTypes = {
  locale: PropTypes.string,
};
