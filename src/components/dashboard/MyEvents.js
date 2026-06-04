import React from 'react';
import Link from 'next/link';
import { getUserEvents } from '@/lib/graphql/events';
import { getLocalizedUrl } from '@/lib/constants';
import DeleteEventButton from './DeleteEventButton';

export default async function MyEvents({ locale }) {
  const events = await getUserEvents();

  return (
    <div>
      <Link href={getLocalizedUrl("/dashboard", locale)} className="dashboard-back-btn">
        <span className="material-symbols-outlined">arrow_back</span> Back to Dashboard
      </Link>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1rem', borderBottom: '1px solid #f1f5f9' }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0' }}>My Events</h1>
          <p style={{ margin: 0 }}>Manage your submitted events.</p>
        </div>
        <Link href={getLocalizedUrl("/events/create", locale)} className="listing-primary-btn" style={{ textDecoration: 'none' }}>
          <span className="material-symbols-outlined">add_circle</span> Add New Event
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="blank-state" style={{ textAlign: 'center', padding: '3rem', background: '#f9f9f9', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1.5rem' }}>You haven&apos;t submitted any events yet.</p>
          <Link href={getLocalizedUrl("/events/create", locale)} style={{ color: '#e04c4c', fontWeight: '600' }}>Submit your first event now</Link>
        </div>
      ) : (
        <div className="listings-grid" style={{ display: 'grid', gap: '1.5rem' }}>
          {events.map((event) => {
            const isPending = event.status === 'PENDING';
            const isDraft = event.status === 'DRAFT';
            let statusBadgeColor = '#10b981'; // Publish
            let statusLabel = 'Published';

            if (isPending) {
              statusBadgeColor = '#f59e0b';
              statusLabel = 'Pending';
            } else if (isDraft) {
              statusBadgeColor = '#64748b';
              statusLabel = 'Draft';
            }

            return (
              <div key={event.databaseId} style={{ backgroundColor: '#ffffff', padding: '1.5rem 2rem', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{event.title}</h3>
                    <span style={{ backgroundColor: statusBadgeColor, color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                      {statusLabel}
                    </span>
                  </div>
                  <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                    Submitted on {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Link href={getLocalizedUrl(`/events/${event.slug}`, locale)} style={{ color: '#e04c4c', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>
                    View
                  </Link>
                  <span style={{ color: '#e2e8f0' }}>|</span>
                  <Link href={getLocalizedUrl(`/dashboard/events/edit/${event.databaseId}`, locale)} style={{ color: '#4a5568', fontWeight: '600', textDecoration: 'none', fontSize: '0.95rem' }}>
                    Edit
                  </Link>
                  <span style={{ color: '#e2e8f0' }}>|</span>
                  <DeleteEventButton eventId={event.databaseId} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
