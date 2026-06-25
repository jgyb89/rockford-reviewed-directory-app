"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";
import SearchModal from "@/components/layout/SearchModal";
import styles from "./Navbar.module.css";
import capeCoralLogo from "../../../public/cape-coral-reviewed-logo.svg";
import Image from "next/image";
import { getLocalizedUrl } from "@/lib/constants";
import { categories } from "@/lib/navigation";
import { getCurrentViewer } from "@/lib/actions";

export default function Navbar({ currentUser: propCurrentUser, dict, locale }) {
  const [user, setUser] = useState(propCurrentUser);

  useEffect(() => {
    setUser(propCurrentUser);
  }, [propCurrentUser]);

  useEffect(() => {
    if (typeof window !== "undefined" && document.cookie.includes("hasSession=true")) {
      async function fetchUser() {
        try {
          const viewer = await getCurrentViewer();
          if (viewer) {
            setUser(viewer);
          }
        } catch (err) {
          console.error("Failed to fetch current user in Navbar:", err);
        }
      }
      fetchUser();
    }
  }, []);
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isListingsOpen, setIsListingsOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const [mobileLevel, setMobileLevel] = useState(1);
  const [activeSubMenu, setActiveSubMenu] = useState(null); // 'listings' or 'account'
  const [activeCategory, setActiveCategory] = useState(null);

  const toggleLocale = () => {
    const newLocale = locale === "en" ? "es" : "en";
    const pathParts = pathname.split("/");
    pathParts[1] = newLocale;
    router.push(pathParts.join("/"));
  };

  const closeMobileMenu = () => {
    setIsMobileOpen(false);
    // Wait for slide animation to finish before resetting panels
    setTimeout(() => {
      setMobileLevel(1);
      setActiveSubMenu(null);
      setActiveCategory(null);
    }, 300);
  };

  const t = dict?.nav || {};

  const getSubmitAction = () => {
    if (!user) {
      return {
        href: getLocalizedUrl("/register-business", locale),
        label: t.submitBusiness || "Submit your Business",
      };
    }
    const userRoles =
      user.roles?.nodes?.map((node) => node.name.toLowerCase()) || [];
    if (userRoles.includes("business") || userRoles.includes("administrator")) {
      return {
        href: getLocalizedUrl("/submit-listing", locale),
        label: t.submitBusiness || "Submit your Business",
      };
    }
    return {
      href: getLocalizedUrl("/user-to-business", locale),
      label: dict?.userToBusiness?.sidebarButton || "Upgrade to Business",
    };
  };

  const submitAction = getSubmitAction();

  const userRoles = user?.roles?.nodes?.map((node) => node.name.toLowerCase()) || [];
  const isBusinessOrAdmin = userRoles.includes("business") || userRoles.includes("administrator");


  return (
    <>
      <nav className={styles['main-nav']}>
        <Link href={getLocalizedUrl("/", locale)} className={styles['nav-brand']}>
          <Image
            src={capeCoralLogo}
            alt="Cape Coral Reviewed Logo"
            className={styles['nav-logo']}
            priority // Recommended for logos/above-the-fold content
          />
        </Link>

        <div className={styles['mobile-actions']}>
          <button
            className={styles['mobile-search-btn']}
            onClick={() => setIsSearchModalOpen(true)}
            aria-label="Open Search"
          >
            <span className="material-symbols-outlined">search</span>
          </button>

          <button
            className={styles['mobile-menu-btn']}
            onClick={() =>
              isMobileOpen ? closeMobileMenu() : setIsMobileOpen(true)
            }
          >
            <span className="material-symbols-outlined">
              {isMobileOpen ? "close" : "menu"}
            </span>
          </button>
        </div>

        <div className={`${styles['nav-links']} ${isMobileOpen ? styles['mobile-open'] : ""}`}>
          <button
            onClick={() => setIsSearchModalOpen(true)}
            className={styles['nav-link']}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1.2rem", marginTop: "-2px" }}
            >
              search
            </span>{" "}
            {t.search || "Search"}
          </button>

          <div
            className={`${styles['nav-link']} ${styles['nav-link--all-listings']}`}
            onMouseEnter={() => setIsListingsOpen(true)}
            onMouseLeave={() => setIsListingsOpen(false)}
            tabIndex={0}
            onFocus={() => setIsListingsOpen(true)}
            onBlur={() => setIsListingsOpen(false)}
          >
            <Link 
              href={getLocalizedUrl("/directory", locale)} 
              className={`${styles['nav-link']} ${styles['nav-link__trigger']}`}
              onClick={() => {
                if (typeof setIsListingsOpen === 'function') setIsListingsOpen(false);
                if (typeof setActiveSubMenu === 'function') setActiveSubMenu(null);
                if (typeof setMobileLevel === 'function') setMobileLevel(1);
                if (typeof setIsMobileOpen === 'function') setIsMobileOpen(false);
              }}
            >
              {t.allListings || "All Listings"}{" "}
              <span className={`material-symbols-outlined ${styles['nav-link__icon']}`}>
                expand_more
              </span>
            </Link>
            
            {isListingsOpen && (
              <div className={styles['mega-menu']}>
                <div className={styles['mega-menu-grid']}>
                  {categories.map((cat) => (
                    <div key={cat.slug} className={styles['mega-menu-column']}>
                      <h4 className={styles['mega-menu-title']}>
                        {cat.icon} {cat.title}
                      </h4>
                      <div className={styles['mega-menu-subs']}>
                        {cat.subs.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={getLocalizedUrl(`/directory/${cat.slug}/${sub.slug}`, locale)}
                            className={styles['mega-menu-sub-link']}
                            onClick={() => setIsListingsOpen(false)}
                          >
                            {sub.icon} {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles['mega-menu-footer']}>
                  <Link 
                    href={getLocalizedUrl("/directory", locale)} 
                    className={styles['mega-menu-all-link']} 
                    onClick={() => setIsListingsOpen(false)}
                  >
                    {t.viewAllDirectory || "View All Directory"}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link href={getLocalizedUrl("/blog", locale)} className={styles['nav-link']}>
            {t.news || "News & Reviews"}
          </Link>

          <Link href={getLocalizedUrl("/events", locale)} className={styles['nav-link']}>
            {t.events || "Events"}
          </Link>

          <Link href={getLocalizedUrl("/about", locale)} className={styles['nav-link']}>
            {t.about || "About"}
          </Link>

          <div className={styles['locale-toggle-container']} style={{ display: 'none' }}>
            <button 
              className={`${styles['locale-btn']} ${locale === 'en' ? styles['active'] : ''}`}
              onClick={toggleLocale}
            >
              {locale === 'en' ? 'ES' : 'EN'}
            </button>
          </div>

          {user ? (
            // LOGGED IN STATE
            <>
              <div
                className={styles['nav-link']}
                onMouseEnter={() => setIsAccountOpen(true)}
                onMouseLeave={() => setIsAccountOpen(false)}
                tabIndex={0}
                onFocus={() => setIsAccountOpen(true)}
                onBlur={() => setIsAccountOpen(false)}
              >
                <div className={styles['nav-link__trigger']}>
                  {t.myAccount || "My Account"}{" "}
                  <span className={`material-symbols-outlined ${styles['nav-link__icon']}`}>
                    expand_more
                  </span>
                </div>
                {isAccountOpen && (
                  <div className={styles['nav-dropdown']}>
                    <Link href={getLocalizedUrl("/dashboard", locale)}>{t.profile || "Profile"}</Link>
                    <Link href={getLocalizedUrl("/dashboard/favorites", locale)}>{t.favorites || "Favorites"}</Link>
                    <Link href={getLocalizedUrl("/dashboard/reviews", locale)}>{t.myReviews || "My Reviews"}</Link>
                    {isBusinessOrAdmin && (
                      <Link href={getLocalizedUrl("/dashboard/listings", locale)}>{t.myListings || "My Listings"}</Link>
                    )}
                    <button onClick={() => setIsLogoutModalOpen(true)}>
                      {t.signOut || "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
              <div className={styles['business-signup']}>
                <Link href={submitAction.href}>{submitAction.label}</Link>
              </div>
            </>
          ) : (
            // LOGGED OUT STATE
            <>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className={`${styles['nav-link']} ${styles['nav-login-btn']}`}
              >
                {t.login || "Log in"}
              </button>
              <div className={styles['sign-up-button']}>
                <Link href={getLocalizedUrl("/register", locale)}>{t.joinCommunity || "Join Community"}</Link>
              </div>
              <div className={styles['business-signup']}>
                <Link href={submitAction.href}>{submitAction.label}</Link>
              </div>
            </>
          )}
        </div>
      </nav>

      {/* MOBILE FLYOUT MENU */}
      <div className={styles['mobile-flyout']}>
        <div
          className={`${styles['flyout-overlay']} ${isMobileOpen ? styles['open'] : ""}`}
          onClick={closeMobileMenu}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              closeMobileMenu();
            }
          }}
          role="button"
          tabIndex={isMobileOpen ? 0 : -1}
          aria-label="Close menu"
        />

        <aside
          className={`${styles['flyout-drawer']} ${isMobileOpen ? styles['open'] : ""}`}
          data-level={mobileLevel}
        >
          <div className={styles['flyout-header']}>
            <Link href={getLocalizedUrl("/", locale)} className={styles['flyout-brand']} onClick={closeMobileMenu}>
              Cape Coral Directory
            </Link>
            <button className={styles['flyout-close']} onClick={closeMobileMenu}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className={styles['flyout-panels']}>
            {/* LEVEL 1: Main Menu */}
            <section className={`${styles['flyout-panel']} ${styles['panel-1']}`}>
              <ul className={styles['flyout-list']}>
                <li className={styles['flyout-item']}>
                  <button
                    className={`${styles['flyout-link']} ${styles['flyout-link--search']}`}
                    onClick={() => {
                      closeMobileMenu();
                      setIsSearchModalOpen(true);
                    }}
                  >
                    <span>
                      <span className={`material-symbols-outlined ${styles['flyout-icon--search']}`}>
                        search
                      </span>
                      {t.search || "Search"}
                    </span>
                  </button>
                </li>
                <li className={styles['flyout-item']}>
                  <button
                    className={styles['flyout-action']}
                    onClick={() => {
                      setMobileLevel(2);
                      setActiveSubMenu("listings");
                    }}
                  >
                    {t.allListings || "All Listings"}{" "}
                    <span className={`material-symbols-outlined ${styles['flyout-icon']}`}>
                      chevron_right
                    </span>
                  </button>
                </li>
                <li className={styles['flyout-item']}>
                  <Link
                    href={getLocalizedUrl("/blog", locale)}
                    className={styles['flyout-link']}
                    onClick={closeMobileMenu}
                  >
                    {t.news || "News & Reviews"}
                  </Link>
                </li>
                <li className={styles['flyout-item']}>
                  <Link
                    href={getLocalizedUrl("/events", locale)}
                    className={styles['flyout-link']}
                    onClick={closeMobileMenu}
                  >
                    {t.events || "Events"}
                  </Link>
                </li>
                <li className={styles['flyout-item']}>
                  <Link
                    href={getLocalizedUrl("/about", locale)}
                    className={styles['flyout-link']}
                    onClick={closeMobileMenu}
                  >
                    {t.about || "About"}
                  </Link>
                </li>

                {user ? (
                  <li className={styles['flyout-item']}>
                    <button
                      className={styles['flyout-action']}
                      onClick={() => {
                        setMobileLevel(2);
                        setActiveSubMenu("account");
                      }}
                    >
                      {t.myAccount || "My Account"}{" "}
                      <span className={`material-symbols-outlined ${styles['flyout-icon']}`}>
                        chevron_right
                      </span>
                    </button>
                  </li>
                ) : (
                  <li className={styles['flyout-item']}>
                    <button
                      className={styles['flyout-link']}
                      onClick={() => {
                        closeMobileMenu();
                        setIsLoginModalOpen(true);
                      }}
                    >
                      {t.login || "Log in"}
                    </button>
                  </li>
                )}

                <li className={styles['flyout-item']}>
                  <button
                    className={styles['flyout-link']}
                    onClick={toggleLocale}
                  >
                    Language: {locale.toUpperCase() === 'EN' ? 'Spanish (ES)' : 'English (EN)'}
                  </button>
                </li>
              </ul>

              {/* Bottom CTAs */}
              <div className={styles['flyout-cta-wrap']}>
                {!user && (
                  <div className={styles['sign-up-button']}>
                    <Link href={getLocalizedUrl("/register", locale)} onClick={closeMobileMenu}>
                      {t.joinCommunity || "Join Community"}
                    </Link>
                  </div>
                )}
                <div className={styles['business-signup']}>
                  <Link href={submitAction.href} onClick={closeMobileMenu}>
                    {submitAction.label}
                  </Link>
                </div>
              </div>
            </section>

            {/* LEVEL 2: Sub Menus */}
            <section className={`${styles['flyout-panel']} ${styles['panel-2']}`}>
              <button className={styles['flyout-back']} onClick={() => setMobileLevel(1)}>
                <span className={`material-symbols-outlined ${styles['flyout-back-icon']}`}>
                  chevron_left
                </span>{" "}
                Back
              </button>

              {activeSubMenu === "listings" && (
                <>
                  <h3 className={styles['flyout-panel-title']}>Categories</h3>
                  <ul className={styles['flyout-list']}>
                    <li className={styles['flyout-item']}>
                      <Link
                        href={getLocalizedUrl("/directory", locale)}
                        className={styles['flyout-link']}
                        onClick={closeMobileMenu}
                      >
                        {t.viewAllDirectory || "View All Directory"}
                      </Link>
                    </li>
                    {categories.map((cat) => (
                      <li key={cat.slug} className={styles['flyout-item']}>
                        <button
                          className={styles['flyout-action']}
                          onClick={() => {
                            setMobileLevel(3);
                            setActiveCategory(cat);
                          }}
                        >
                          <span className={styles['flyout-category-btn']}>
                            {cat.icon} {cat.title}
                          </span>
                          <span className={`material-symbols-outlined ${styles['flyout-icon']}`}>
                            chevron_right
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {activeSubMenu === "account" && (
                <>
                  <h3 className={styles['flyout-panel-title']}>Dashboard</h3>
                  <ul className={styles['flyout-list']}>
                    <li className={styles['flyout-item']}>
                      <Link
                        href={getLocalizedUrl("/dashboard", locale)}
                        className={styles['flyout-link']}
                        onClick={closeMobileMenu}
                      >
                        {t.profile || "Profile Settings"}
                      </Link>
                    </li>
                    <li className={styles['flyout-item']}>
                      <Link
                        href={getLocalizedUrl("/dashboard/favorites", locale)}
                        className={styles['flyout-link']}
                        onClick={closeMobileMenu}
                      >
                        {t.favorites || "Favorite Listings"}
                      </Link>
                    </li>
                    <li className={styles['flyout-item']}>
                      <Link
                        href={getLocalizedUrl("/dashboard/reviews", locale)}
                        className={styles['flyout-link']}
                        onClick={closeMobileMenu}
                      >
                        {t.myReviews || "My Reviews"}
                      </Link>
                    </li>
                    {isBusinessOrAdmin && (
                      <li className={styles['flyout-item']}>
                        <Link
                          href={getLocalizedUrl("/dashboard/listings", locale)}
                          className={styles['flyout-link']}
                          onClick={closeMobileMenu}
                        >
                          {t.myListings || "My Listings"}
                        </Link>
                      </li>
                    )}
                    <li className={styles['flyout-item']}>
                      <button
                        className={styles['flyout-link']}
                        onClick={() => {
                          closeMobileMenu();
                          setIsLogoutModalOpen(true);
                        }}
                      >
                        {t.signOut || "Sign Out"}
                      </button>
                    </li>
                  </ul>
                </>
              )}
            </section>

            {/* LEVEL 3: Categories */}
            <section className={`${styles['flyout-panel']} ${styles['panel-3']}`}>
              <button className={styles['flyout-back']} onClick={() => setMobileLevel(2)}>
                <span className={`material-symbols-outlined ${styles['flyout-back-icon']}`}>
                  chevron_left
                </span>{" "}
                Back
              </button>

              {activeCategory && (
                <>
                  <h3 className={styles['flyout-panel-title']}>{activeCategory.title}</h3>
                  <ul className={styles['flyout-list']}>
                    {/* NEW: View All Category Link */}
                    <li className={styles['flyout-item']}>
                      <Link
                        href={getLocalizedUrl(`/directory/${activeCategory.slug}`, locale)}
                        className={styles['flyout-link']}
                        onClick={closeMobileMenu}
                      >
                        <span className={styles['flyout-category-btn']} style={{ fontWeight: 700, color: '#e04c4c' }}>
                          View All {activeCategory.title}
                        </span>
                      </Link>
                    </li>
                    
                    {activeCategory.subs.map((sub) => (
                      <li key={sub.slug} className={styles['flyout-item']}>
                        <Link
                          href={getLocalizedUrl(`/directory/${activeCategory.slug}/${sub.slug}`, locale)}
                          className={styles['flyout-link']}
                          onClick={closeMobileMenu}
                        >
                          <span className={styles['flyout-category-btn']}>
                            {sub.icon} {sub.name}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          </div>
        </aside>
      </div>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchModalOpen} 
        onClose={() => setIsSearchModalOpen(false)} 
        dict={dict}
        locale={locale}
      />

      {/* Existing Login Modal */}
      <Suspense fallback={null}>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          dict={dict}
          locale={locale}
        />
      </Suspense>

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className={styles['logout-modal']}>
          <div className={styles['logout-modal__dialog']}>
            <p className={styles['logout-modal__text']}>
              Are you sure you want to log out?
            </p>
            <div className={styles['logout-modal__actions']}>
              <a
                href={getLocalizedUrl("/logout", locale)}
                className={`${styles['logout-modal__button']} ${styles['logout-modal__button--confirm']}`}
              >
                Yes, Log Out
              </a>
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className={`${styles['logout-modal__button']} ${styles['logout-modal__button--cancel']}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
