'use client';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import PropTypes from 'prop-types';

export default function DashboardSortDropdown({ currentSortProp, onSortChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Use local state if provided (Client), else read from URL (Server)
  const currentSort = currentSortProp || searchParams.get('sort') || 'newest';

  const handleChange = (e) => {
    const val = e.target.value;
    if (onSortChange) {
      onSortChange(val);
    } else {
      const params = new URLSearchParams(searchParams);
      params.set('sort', val);
      params.set('page', '1'); // Reset to page 1 on sort
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
      <select 
        value={currentSort} 
        onChange={handleChange}
        style={{
          padding: '0.6rem 2.5rem 0.6rem 1rem',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          backgroundColor: '#ffffff',
          color: '#334155',
          fontSize: '0.95rem',
          fontWeight: '500',
          cursor: 'pointer',
          outline: 'none',
          appearance: 'none',
          fontFamily: 'inherit',
          backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%24%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          backgroundSize: '1.2rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="az">A - Z</option>
        <option value="za">Z - A</option>
      </select>
    </div>
  );
}

DashboardSortDropdown.propTypes = {
  currentSortProp: PropTypes.string,
  onSortChange: PropTypes.func,
};
