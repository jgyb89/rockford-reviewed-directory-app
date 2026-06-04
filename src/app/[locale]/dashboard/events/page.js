import React from 'react';
import MyEvents from '@/components/dashboard/MyEvents';

export default async function MyEventsPage({ params }) {
  const { locale } = await params;
  return (
    <div className="my-events-page">
      <MyEvents locale={locale} />
    </div>
  );
}
