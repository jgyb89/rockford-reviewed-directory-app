// src/app/dashboard/layout.js
import Link from 'next/link';
import { getViewer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import PropTypes from 'prop-types';
import Sidebar from '@/components/dashboard/Sidebar';
import './Dashboard.css';

export default async function DashboardLayout({ children, params }) {
  const { locale } = await params;
  
  // 1. Explicitly check for the auth cookie before anything else
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect(`/login`);
  }

  // 2. Fetch the viewer data
  const viewer = await getViewer();

  // Redundancy check if middleware is bypassed or token is invalid
  if (!viewer) {
    redirect(`/login`);
  }

  const userRoles = viewer.roles.nodes.map((role) => role.name.toLowerCase());

  return (
    <div className="dashboard-layout">
      <Sidebar user={viewer} userRoles={userRoles} locale={locale} />

      <main className="dashboard-content">
        {children}
      </main>
    </div>
  );
}

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.object.isRequired,
};
