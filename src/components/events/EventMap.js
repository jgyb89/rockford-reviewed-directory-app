"use client";

import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const libraries = ['places'];

// 1. ISOLATED INNER COMPONENT: Prevents React re-mounting loops and traps the API hook!
const ActiveMapCanvas = memo(({ lat, lng }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const center = { lat, lng };

  if (!isLoaded) {
    return (
      <div style={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Loading Map...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={15}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
      }}
    >
      <Marker position={center} />
    </GoogleMap>
  );
});
ActiveMapCanvas.displayName = "ActiveMapCanvas";

// 2. MAIN COMPONENT: Renders the Zero-Cost Placeholder until activated
export default function EventMap({ lat, lng, address }) {
  const [isActivated, setIsActivated] = useState(false);

  // Safety fallback
  if (!lat || !lng) return null;

  // Unactivated State (The Zero-Cost Placeholder)
  if (!isActivated) {
    return (
      <div 
        style={{
          ...containerStyle,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          padding: '2rem',
          textAlign: 'center'
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: '#e57007', marginBottom: '0.5rem' }}>
          location_on
        </span>
        <p style={{ color: '#334155', fontSize: '1.1rem', marginBottom: '1.5rem', maxWidth: '80%', fontWeight: '500' }}>
          {address || "View location on map"}
        </p>
        <button 
          onClick={() => setIsActivated(true)}
          className="listing-primary-btn"
          style={{ padding: '0.75rem 2rem', border: 'none', cursor: 'pointer' }}
        >
          Show Map
        </button>
      </div>
    );
  }

  // Activated State (Executes Google Maps Script)
  return <ActiveMapCanvas lat={lat} lng={lng} />;
}

ActiveMapCanvas.propTypes = {
  lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

EventMap.propTypes = {
  lat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  lng: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  address: PropTypes.string,
};
