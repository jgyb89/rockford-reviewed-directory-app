"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';
import ProfileAvatar from './ProfileAvatar';
import { getLocalizedUrl } from "@/lib/constants";

export default function Sidebar({ user, userRoles, locale }) {
  const pathname = usePathname();
  const isAdminOrBusiness = userRoles.includes('business') || userRoles.includes('administrator');

  const links = [
    {
      href: getLocalizedUrl("/dashboard/profile", locale),
      label: 'Profile Settings',
      icon: 'person'
    },
    {
      href: getLocalizedUrl("/dashboard/favorites", locale),
      label: 'Favorite Listings',
      icon: 'favorite'
    },
    {
      href: getLocalizedUrl("/dashboard/reviews", locale),
      label: 'My Reviews',
      icon: 'rate_review'
    },
    {
      href: getLocalizedUrl("/dashboard/events", locale),
      label: 'My Events',
      icon: 'event'
    }
  ];

  if (isAdminOrBusiness) {
    links.push({
      href: getLocalizedUrl("/dashboard/listings", locale),
      label: 'My Listings',
      icon: 'storefront'
    });
  }

  return (
    <aside className="dashboard-nav">
      <ProfileAvatar user={user} />
      <ul className="dashboard-nav__list">
        {links.map((link) => {
          const isActive = link.exact 
            ? pathname === link.href 
            : pathname.startsWith(link.href);

          return (
            <li key={link.href} className="dashboard-nav__item">
              <Link 
                href={link.href} 
                className={`dashboard-nav__link ${isActive ? 'active' : ''}`}
              >
                <div className="dashboard-nav__link-left">
                  <span className="material-symbols-outlined">{link.icon}</span>
                  <span>{link.label}</span>
                </div>
                <span className="material-symbols-outlined dashboard-nav__link-arrow">
                  chevron_right
                </span>
              </Link>
            </li>
          );
        })}

        <li className="dashboard-nav__item" style={{ marginTop: 'auto' }}>
          <a href={getLocalizedUrl("/logout", locale)} className="dashboard-nav__link dashboard-nav__link--signout">
            <div className="dashboard-nav__link-left">
              <span className="material-symbols-outlined">logout</span>
              <span>Sign Out</span>
            </div>
            <span className="material-symbols-outlined dashboard-nav__link-arrow">
              chevron_right
            </span>
          </a>
        </li>
      </ul>
    </aside>
  );
}

Sidebar.propTypes = {
  user: PropTypes.object.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  locale: PropTypes.string.isRequired,
};
