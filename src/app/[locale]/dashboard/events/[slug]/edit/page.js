import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getAuthEventBySlug } from '@/lib/graphql/events';
import { getViewer } from '@/lib/auth';
import EditEventForm from '@/components/events/EditEventForm';
import { getLocalizedUrl } from '@/lib/constants';
import Link from 'next/link';

export default async function EditEventPage({ params }) {
  const { locale, slug } = await params;
  
  const viewer = await getViewer();
  if (!viewer) {
    redirect(getLocalizedUrl('/login', locale));
  }

  const event = await getAuthEventBySlug(slug);

  if (!event) {
    notFound();
  }

  return (
    <div>
      <Link href={getLocalizedUrl("/dashboard/events", locale)} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span> Back to My Events
      </Link>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>Edit Event</h1>
          <p style={{ margin: 0 }}>Update details for &quot;{event.title}&quot;.</p>
        </div>
      </header>

      <EditEventForm initialData={event} locale={locale} />
    </div>
  );
}
