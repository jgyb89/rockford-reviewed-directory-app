// src/app/dashboard/favorites/page.js
import PropTypes from 'prop-types';
import { getViewer } from '@/lib/auth';
import FavoriteListings from '@/components/dashboard/FavoriteListings';
import Link from 'next/link';

export const metadata = {
  title: 'Favorite Listings | Dashboard',
};

export default async function FavoritesPage({ params }) {
  const { locale } = await params;
  const viewer = await getViewer();

  // Handle case where viewer is null (though middleware/layout should prevent this)
  if (!viewer) {
    return (
      <div className="favorites-page">
        <h1 className="favorites-page__title">Favorite Listings</h1>
        <p className="favorites-page__error">You must be logged in to view your favorites.</p>
      </div>
    );
  }

  const favorites = viewer.userData?.favoriteListings?.nodes || [];

  return (
    <div className="favorites-page">
      <Link href={`/dashboard`} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span> Back to Dashboard
      </Link>
      <header style={{ marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Favorite Listings</h1>
        <p style={{ margin: 0 }}>
          Manage your saved business listings here.
        </p>
      </header>

      <div className="favorites-page__content">
        <FavoriteListings favorites={favorites} locale={locale} />
      </div>
    </div>
  );
}

FavoritesPage.propTypes = {
  params: PropTypes.object.isRequired,
};
