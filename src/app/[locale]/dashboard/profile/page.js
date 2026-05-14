// src/app/[locale]/dashboard/profile/page.js
import PropTypes from 'prop-types';
import { getViewer } from '@/lib/auth';
import ProfileForm from '@/components/dashboard/ProfileForm';
import Link from 'next/link';

export const metadata = {
  title: 'Profile Settings | Dashboard',
};

export default async function ProfilePage({ params }) {
  const { locale } = await params;
  const viewer = await getViewer();

  // Handle cases where viewer might be null (though layout should catch it)
  if (!viewer) {
    return (
      <div className="profile-settings">
        <Link href={`/dashboard`} className="mobile-back-btn">
          <span className="material-symbols-outlined">arrow_back</span> Back to Menu
        </Link>
        <h1 className="profile-settings__title">Profile Settings</h1>
        <p className="profile-settings__error">You are not logged in.</p>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      <Link href={`/dashboard`} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span> Back to Dashboard
      </Link>
      <header style={{ marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ margin: '0 0 0.5rem 0' }}>Profile Settings</h1>
        <p style={{ margin: 0 }}>
          Update your personal information and manage how your email is displayed on the directory.
        </p>
      </header>
      
      <div className="profile-settings__content">
        <ProfileForm viewer={viewer} />
      </div>
    </div>
  );
}

ProfilePage.propTypes = {
  params: PropTypes.object.isRequired,
};
