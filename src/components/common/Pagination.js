'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './Pagination.module.css';

export default function Pagination({ totalItems, itemsPerPage, currentPageProp, onPageChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  // Use local state prop if provided (Client), otherwise read from URL (Server)
  const currentPage = currentPageProp || parseInt(searchParams.get('page') || '1', 10);

  const handlePageChange = (page) => {
    if (onPageChange) {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const params = new URLSearchParams(searchParams);
      params.set('page', page);
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  // Simple array map for page buttons
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className={styles.pagination}>
      <button disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} className={styles.btn}>
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <div className={styles.pageNumbers}>
        {pages.map(page => (
          <button
            key={page}
            className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}
      </div>
      <button disabled={currentPage === totalPages} onClick={() => handlePageChange(currentPage + 1)} className={styles.btn}>
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}
