import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeleteListingButton from '@/components/dashboard/DeleteListingButton';
import Pagination from '@/components/common/Pagination';

export default async function MyListingsPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams?.page || '1', 10);
  const ITEMS_PER_PAGE = 10;
  
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;

  if (!authToken) {
    redirect(`/${locale}`);
  }

  const query = `
    query GetMyListings {
      viewer {
        roles { nodes { name } }
        ccrlistings {
          nodes {
            databaseId
            title
            slug
            date
          }
        }
      }
    }
  `;

  const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });

  const json = await res.json();
  const viewer = json.data?.viewer;

  if (!viewer) {
    redirect(`/${locale}`);
  }

  const roles = viewer.roles.nodes.map(r => r.name.toLowerCase());
  if (!roles.includes('business') && !roles.includes('administrator')) {
    redirect(`/${locale}/dashboard`);
  }

  const listings = viewer.ccrlistings?.nodes || [];
  const paginatedListings = listings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="my-listings-page">
      <Link href={`/${locale}/dashboard`} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span> Back to Dashboard
      </Link>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>My Listings</h1>
          <p style={{ margin: 0 }}>Manage your business listings and update their details.</p>
        </div>
        <Link href={`/${locale}/submit-listing`} className="listing-primary-btn" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">add_business</span>
          Add New Listing
        </Link>
      </header>

      {listings.length === 0 ? (
        <div className="blank-state" style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1.5rem' }}>You haven't posted any listings yet.</p>
          <Link href={`/${locale}/submit-listing`} style={{ color: '#e04c4c', fontWeight: '600' }}>Create your first listing now</Link>
        </div>
      ) : (
        <div className="listings-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          {paginatedListings.map((listing) => (
            <div key={listing.databaseId} className="listing-item" style={{ backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>{listing.title}</h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  Published on {new Date(listing.date).toLocaleDateString()}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Link href={`/${locale}/listing/${listing.slug}`} style={{ color: '#e04c4c', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>
                  View
                </Link>
                <span style={{ color: '#e2e8f0' }}>|</span>
                <Link href={`/${locale}/dashboard/listings/edit/${listing.databaseId}`} style={{ color: '#4a5568', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>
                  Edit
                </Link>
                <span style={{ color: '#e2e8f0' }}>|</span>
                <DeleteListingButton listingId={listing.databaseId} className="btn-delete" />
              </div>
            </div>
          ))}
          <Pagination totalItems={listings.length} itemsPerPage={ITEMS_PER_PAGE} />
        </div>
      )}
    </div>
  );
}
