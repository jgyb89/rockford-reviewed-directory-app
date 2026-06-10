"use client";

import React, { useState, memo } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px',
};

const libraries = ['places'];

function ActiveMapCanvas({ lat, lng, address }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const center = { lat: parseFloat(lat), lng: parseFloat(lng) };

  if (!isLoaded) {
    return (
      <div style={{ 
        height: '400px', 
        width: '100%', 
        backgroundColor: '#f8fafc', 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ color: '#94a3b8', fontSize: '1.1rem', fontWeight: '500' }}>Loading map...</div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={{
        disableDefaultUI: true,
        zoomControl: true,
      }}
    >
      <Marker position={center} title={address} />
    </GoogleMap>
  );
}

function EventMap({ lat, lng, address }) {
  const [isActivated, setIsActivated] = useState(false);

  if (!lat || !lng) return null;

  return (
    <div style={{ marginTop: '2.5rem' }}>
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>Location</h3>
      
      {isActivated ? (
        <ActiveMapCanvas lat={lat} lng={lng} address={address} />
      ) : (
        <div style={{
          height: '400px',
          width: '100%',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#64748b', marginBottom: '1rem' }} aria-hidden="true">
            location_on
          </span>
          <p style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '1.5rem', maxWidth: '400px', lineHeight: '1.5' }}>
            {address}
          </p>
          <button 
            className="listing-primary-btn" 
            onClick={() => setIsActivated(true)}
            style={{ padding: '0.75rem 2.5rem', border: 'none', cursor: 'pointer', borderRadius: '8px', fontSize: '1rem', fontWeight: '600' }}
          >
            Show Map
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(EventMap);
