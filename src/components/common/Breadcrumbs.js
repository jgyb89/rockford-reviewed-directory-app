'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ALL_CATEGORIES, DIRECTORY_TYPES } from '@/lib/constants';

export default function Breadcrumbs({ locale = 'en' }) {
  const pathname = usePathname();

  // Split the URL and ignore empty strings
  const pathSegments = pathname.split('/').filter(Boolean);

  // Find where 'directory' starts in the URL to anchor our logic
  const directoryIndex = pathSegments.indexOf('directory');
  if (directoryIndex === -1) return null;

  const breadcrumbs = [];

  // 1. Base Directory Link
  breadcrumbs.push({
    label: 'Directory',
    href: `/${locale}/directory`,
  });

  // 2. Directory Type (e.g., Health & Wellness)
  if (pathSegments.length > directoryIndex + 1) {
    const dirTypeSlug = pathSegments[directoryIndex + 1];
    const dirType = DIRECTORY_TYPES.find(d => d.slug === dirTypeSlug);
    
    if (dirType) {
      breadcrumbs.push({
        label: dirType.name,
        href: `/${locale}/directory/${dirTypeSlug}`,
      });
    }

    // 3. Sub-Category (e.g., Beauty & Spas)
    if (pathSegments.length > directoryIndex + 2) {
      const categorySlug = pathSegments[directoryIndex + 2];
      const category = ALL_CATEGORIES.find(c => c.slug === categorySlug);
      
      if (category) {
        breadcrumbs.push({
          label: category.name,
          href: `/${locale}/directory/${dirTypeSlug}/${categorySlug}`,
        });
      }
    }
  }

  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
      <ol style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {isLast ? (
                <span style={{ color: '#64748b', fontWeight: '600' }} aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <>
                  <Link 
                     href={crumb.href} 
                     style={{ color: '#e04c4c', textDecoration: 'none', fontWeight: '500', transition: 'opacity 0.2s' }}
                     onMouseOver={(e) => e.currentTarget.style.opacity = 0.7}
                     onMouseOut={(e) => e.currentTarget.style.opacity = 1}
                  >
                    {crumb.label}
                  </Link>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: '#cbd5e1' }}>
                    chevron_right
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
