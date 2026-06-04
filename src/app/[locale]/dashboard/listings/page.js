import PropTypes from 'prop-types';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DeleteListingButton from '@/components/dashboard/DeleteListingButton';
import Pagination from '@/components/common/Pagination';
import DashboardSortDropdown from '@/components/dashboard/DashboardSortDropdown';

export default async function MyListingsPage({ params, searchParams }) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const page = Number.parseInt(resolvedSearchParams?.page || '1', 10);
  const sort = resolvedSearchParams?.sort || 'newest';
  const ITEMS_PER_PAGE = 10;
  
  const cookieStore = await cookies();
  const authToken = cookieStore.get('authToken')?.value;

  if (!authToken) {
    redirect(``);
  }

  const query = `
    query GetMyListings {
      viewer {
        roles { nodes { name } }
        ccrlistings(first: 1000) {
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
      'User-Agent': 'CCR-NextJS-Frontend/1.0',
    },
    body: JSON.stringify({ query }),
    cache: 'no-store',
  });

  let json = null;
  try {
    if (res.ok) {
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        json = await res.json();
      } else {
        console.error(`Unexpected content-type in listings page: ${contentType}`);
      }
    } else {
      console.error(`HTTP Error in listings page: status ${res.status}`);
    }
  } catch (error) {
    console.error("Failed to parse JSON on listings page:", error);
  }

  const viewer = json?.data?.viewer;

  if (!viewer) {
    redirect(`/dashboard`);
  }

  const roles = viewer.roles.nodes.map(r => r.name.toLowerCase());
  if (!roles.includes('business') && !roles.includes('administrator')) {
    redirect(`/dashboard`);
  }

  const listings = viewer.ccrlistings?.nodes || [];

  let sortedListings = [...listings];
  if (sort === 'az') {
    sortedListings.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sort === 'za') {
    sortedListings.sort((a, b) => b.title.localeCompare(a.title));
  } else if (sort === 'oldest') {
    sortedListings.sort((a, b) => new Date(a.date) - new Date(b.date));
  } else {
    // Default: Newest
    sortedListings.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  const paginatedListings = sortedListings.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="my-listings-page">
      <Link href={`/dashboard`} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span>{" "}Back to Dashboard
      </Link>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>My Listings</h1>
          <p style={{ margin: 0 }}>Manage your business listings and update their details.</p>
        </div>
        <Link href={`/submit-listing`} className="listing-primary-btn" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">add_business</span>{" "}
          Add New Listing
        </Link>
      </header>

      {listings.length === 0 ? (
        <div className="blank-state" style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1.5rem' }}>You haven&apos;t posted any listings yet.</p>
          <Link href={`/submit-listing`} style={{ color: '#e04c4c', fontWeight: '600' }}>Create your first listing now</Link>
        </div>
      ) : (
        <>
          <DashboardSortDropdown />
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
                  <Link href={`/listing/${listing.slug}`} style={{ color: '#e04c4c', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>
                    View
                  </Link>
                  <span style={{ color: '#e2e8f0' }}>|</span>
                  <Link href={`/dashboard/listings/edit/${listing.databaseId}`} style={{ color: '#4a5568', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>
                    Edit
                  </Link>
                  <span style={{ color: '#e2e8f0' }}>|</span>
                  <DeleteListingButton listingId={listing.databaseId} className="btn-delete" />
                </div>
              </div>
            ))}
            <Pagination totalItems={listings.length} itemsPerPage={ITEMS_PER_PAGE} />
          </div>
        </>
      )}
    </div>
  );
}

MyListingsPage.propTypes = {
  params: PropTypes.object.isRequired,
  searchParams: PropTypes.object.isRequired,
};
