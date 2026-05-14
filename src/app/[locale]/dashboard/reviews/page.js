// src/app/dashboard/reviews/page.js
import PropTypes from 'prop-types';
import { getViewer } from '@/lib/auth';
import MyReviews from '@/components/dashboard/MyReviews';
import Link from 'next/link';

export const metadata = {
  title: 'My Reviews | Dashboard',
};

export default async function ReviewsPage({ params }) {
  const { locale } = await params;
  const viewer = await getViewer();

  // Redundancy check if middleware/layout is bypassed
  if (!viewer) {
    return (
      <div className="reviews-page">
        <h1 className="reviews-page__title">My Reviews</h1>
        <p className="reviews-page__error">You must be logged in to view your reviews.</p>
      </div>
    );
  }

  const reviews = viewer.ccrreviews?.nodes || [];

  return (
    <div className="reviews-page">
      <Link href={`/dashboard`} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span> Back to Dashboard
      </Link>
      <header style={{ marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>My Reviews</h1>
        <p style={{ margin: 0 }}>
          Manage the reviews you have written for businesses in the directory.
        </p>
      </header>

      <div className="reviews-page__content">
        <MyReviews reviews={reviews} locale={locale} />
      </div>
    </div>
  );
}

ReviewsPage.propTypes = {
  params: PropTypes.object.isRequired,
};
