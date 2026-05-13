// src/components/dashboard/FavoriteListings.js
'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PropTypes from 'prop-types';
import { removeFavoriteListing } from '@/lib/actions';
import { formatImageUrl } from "@/lib/formatImageUrl";
import DashboardSortDropdown from './DashboardSortDropdown';

import styles from './FavoriteListings.module.css';

export default function FavoriteListings({ favorites: initialFavorites = [], locale = 'en' }) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [currentSort, setCurrentSort] = useState('newest');
  const [isRemoving, setIsRemoving] = useState(null);
  const [listingToDelete, setListingToDelete] = useState(null);

  const sortedFavorites = useMemo(() => {
    return [...favorites].sort((a, b) => {
      if (currentSort === 'az') return a.title.localeCompare(b.title);
      if (currentSort === 'za') return b.title.localeCompare(a.title);
      if (currentSort === 'oldest') return new Date(a.date) - new Date(b.date);
      return new Date(b.date) - new Date(a.date); // Default: newest
    });
  }, [favorites, currentSort]);

  if (!favorites || favorites.length === 0) {
    return (
      <div className={styles['favorite-listings__empty']}>
        <p className={styles['favorite-listings__text']}>You haven&apos;t saved any favorite listings yet.</p>
        <Link href="/directory" className={styles['favorite-listings__link']}>
          Browse Directory
        </Link>
      </div>
    );
  }

  const handleRemove = async (databaseId) => {
    setIsRemoving(databaseId);
    const result = await removeFavoriteListing(databaseId);

    if (result.success) {
      setFavorites(favorites.filter((listing) => listing.databaseId !== databaseId));
    } else {
      alert(result.error || 'Failed to remove listing from favorites.');
    }
    setIsRemoving(null);
  };

  return (
    <div className={styles['favorite-listings']}>
      <DashboardSortDropdown currentSortProp={currentSort} onSortChange={setCurrentSort} />
      <div className={styles['favorite-listings__grid']}>
        {sortedFavorites.map((listing) => {
          const imageUrl = formatImageUrl(listing.featuredImage?.node?.sourceUrl);
          const listingUrl = `/${locale}/listing/${listing.slug}`;

          return (
            <article key={listing.databaseId} className={styles['favorite-item']}>
              <div className={styles['favorite-item__content-wrapper']}>
                <div className={styles['favorite-item__image-container']}>
                  <Image
                    src={imageUrl}
                    alt={listing.title}
                    fill
                    sizes="120px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles['favorite-item__info']}>
                  <h4 className={styles['favorite-item__title']}>{listing.title}</h4>
                  <Link href={listingUrl} className={styles['favorite-item__link']}>
                    View Listing
                  </Link>
                </div>
              </div>

              <div className={styles['favorite-item__actions']}>
                <button 
                  onClick={() => setListingToDelete(listing)}
                  disabled={isRemoving === listing.databaseId}
                  className={styles['btn-delete']}
                  type="button"
                >
                  <span className="material-symbols-outlined">delete</span>
                  <span>{isRemoving === listing.databaseId ? 'Removing...' : 'Delete'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {listingToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#e04a3d', marginBottom: '1rem' }}>warning</span>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: '#333' }}>Remove Favorite?</h3>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Are you sure you want to remove <strong>{listingToDelete.title}</strong> from your favorites?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setListingToDelete(null)}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: '1px solid #ccc', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 600, color: '#333' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleRemove(listingToDelete.databaseId);
                  setListingToDelete(null);
                }}
                style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: '#e04a3d', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

FavoriteListings.propTypes = {
  favorites: PropTypes.array,
};
