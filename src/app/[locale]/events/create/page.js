import React from 'react';
import EventWizard from '@/components/events/EventWizard';
import { getViewer } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SubmitEventPage() {
  
  // 1. Explicitly check for the auth cookie
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect(`/login`);
  }

  // 2. Fetch the viewer data
  const viewer = await getViewer();

  if (!viewer) {
    redirect(`/login`);
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px', fontSize: '2.5rem', fontWeight: 'bold' }}>
        Submit a New Event
      </h1>
      <EventWizard />
    </main>
  );
}
