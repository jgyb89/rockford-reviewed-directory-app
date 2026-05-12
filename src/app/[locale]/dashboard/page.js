// src/app/[locale]/dashboard/page.js
import PropTypes from 'prop-types';
import { getViewer } from '@/lib/auth';
import Link from 'next/link';

export const metadata = {
  title: 'Dashboard | Cape Coral Reviewed',
};

export default async function DashboardRoot({ params }) {
  const { locale } = await params;
  const viewer = await getViewer();

  // Extract roles safely
  const roles = viewer?.roles?.nodes?.map(role => role.name.toLowerCase()) || [];
  const isBusiness = roles.includes('business') || roles.includes('administrator');

  return (
    <div className="dashboard-desktop-only">
      <header style={{ marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ margin: '0 0 0.5rem 0', color: '#1e293b' }}>
          Welcome back, {viewer?.firstName || 'User'}!
        </h1>
        <p style={{ margin: 0, color: '#64748b' }}>
          Manage your account activity and explore Cape Coral.
        </p>
      </header>

      {isBusiness ? (
        // ----- BUSINESS ROLE DASHBOARD -----
        <div className="bento-grid">
          <div className="bento-col-small">
            <div className="bento-card">
              <div className="bento-card__header">
                <span className="material-symbols-outlined">reviews</span>
                <h3>Recent Reviews</h3>
              </div>
              <p>Monitor and manage feedback from your customers.</p>
              <Link href={`/${locale}/dashboard/reviews`} className="bento-link">View All &rarr;</Link>
            </div>
            <div className="bento-card">
              <div className="bento-card__header">
                <span className="material-symbols-outlined">favorite</span>
                <h3>Saved Favorites</h3>
              </div>
              <p>Quick access to other local spots you love.</p>
              <Link href={`/${locale}/dashboard/favorites`} className="bento-link">View All &rarr;</Link>
            </div>
          </div>
          <div className="bento-col-large">
            <div className="bento-card bento-card--large">
              <div className="bento-card__header">
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>storefront</span>
                <h3 style={{ fontSize: '1.5rem' }}>My Listings</h3>
              </div>
              <p>View, edit, and optimize your business directory listings. Keep your hours, photos, and descriptions up to date to attract more customers.</p>
              <Link href={`/${locale}/dashboard/listings`} className="bento-link">Manage Listings &rarr;</Link>
            </div>
          </div>
        </div>
      ) : (
        // ----- USER ROLE DASHBOARD -----
        <div className="bento-grid">
          <div className="bento-col-small">
            <div className="bento-card">
              <div className="bento-card__header">
                <span className="material-symbols-outlined">favorite</span>
                <h3>Saved Favorites</h3>
              </div>
              <p>Quick access to your saved spots around Cape Coral.</p>
              <Link href={`/${locale}/dashboard/favorites`} className="bento-link">View All &rarr;</Link>
            </div>
            <div className="bento-card bento-card--highlight">
              <div className="bento-card__header">
                <span className="material-symbols-outlined">add_business</span>
                <h3>Recommend a Business</h3>
              </div>
              <p>Know a great local spot that isn't listed? Let us know so we can add them!</p>
              <Link href={`/${locale}/submit-listing`} className="bento-link">Submit Idea &rarr;</Link>
            </div>
          </div>
          <div className="bento-col-large">
            <div className="bento-card bento-card--large">
              <div className="bento-card__header">
                <span className="material-symbols-outlined" style={{ fontSize: '2rem' }}>reviews</span>
                <h3 style={{ fontSize: '1.5rem' }}>My Reviews</h3>
              </div>
              <p>See all the feedback you've shared with the Cape Coral community. Your reviews help others discover the best places in town!</p>
              <Link href={`/${locale}/dashboard/reviews`} className="bento-link">View My Reviews &rarr;</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

DashboardRoot.propTypes = {
  params: PropTypes.object.isRequired,
};
