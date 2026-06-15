import Link from "next/link";
import Image from "next/image";
import { getLocalizedUrl } from "@/lib/constants";
import styles from "./Footer.module.css";

const EXPLORE_LINKS = [
  { name: "Business Directory", href: "/directory" },
  { name: "Restaurants & Dining", href: "/directory/food-drink" },
  { name: "Home Services", href: "/directory/home-local-services" },
  { name: "Recommend a Business", href: "/recommend" },
  { name: "Newsletter", href: "/newsletter" },
];

const QUICK_LINKS = [
  { name: "About Us", href: "/about" },
  // { name: "Events", href: "/events" },
  { name: "Contact", href: "/contact" },
  { name: "Business Login", href: "/login" },
  { name: "Create an Account", href: "/register" },
];

export default function Footer({ locale = "en" }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles["footer__container"]}>
        {/* Top Section: Grid */}
        <div className={styles["footer__top"]}>
          {/* Column 1: Brand & About */}
          <div className={styles["footer__col"]}>
            <Link
              href={getLocalizedUrl("/", locale)}
              className={styles["footer__logo"]}
            >
              <Image
                src="/cape-coral-reviewed-logo.webp"
                alt="Cape Coral Reviewed"
                width={180}
                height={60}
                style={{ height: "auto", width: "auto", maxWidth: "100%" }}
              />
            </Link>
            <p className={styles["footer__text"]}>
              Your ultimate guide to discovering the best local businesses,
              restaurants, and services in Cape Coral, Florida. Support local!
            </p>
          </div>

          {/* Column 2: Explore */}
          <div className={styles["footer__col"]}>
            <h3 className={styles["footer__heading"]}>Explore</h3>
            <ul className={styles["footer__list"]}>
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedUrl(link.href, locale)}
                    className={styles["footer__link"]}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div className={styles["footer__col"]}>
            <h3 className={styles["footer__heading"]}>Quick Links</h3>
            <ul className={styles["footer__list"]}>
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={getLocalizedUrl(link.href, locale)}
                    className={styles["footer__link"]}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter */}
          <div className={styles["footer__col"]}>
            <h3 className={styles["footer__heading"]}>Stay Updated</h3>
            <p className={styles["footer__text"]}>
              Subscribe to get the latest reviews and local Cape Coral news
              delivered to your inbox.
            </p>
            <form
              className={styles["footer__form"]}
              action="/api/newsletter"
              method="POST"
            >
              <input
                type="email"
                placeholder="Email address"
                required
                className={styles["footer__input"]}
              />
              <button type="submit" className={styles["footer__btn"]}>
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Divider */}
        <hr className={styles["footer__divider"]} />

        {/* Bottom Section: Copyright & Legal */}
        <div className={styles["footer__bottom"]}>
          <p className={styles["footer__copyright"]}>
            &copy; {currentYear} Cape Coral Reviewed. All rights reserved.
          </p>

          <div className={styles["footer__legal"]}>
            <Link
              href={getLocalizedUrl("/privacy-policy", locale)}
              className={styles["footer__legal-link"]}
            >
              Privacy Policy
            </Link>
            <span className={styles["footer__legal-sep"]}>|</span>
            <Link
              href={getLocalizedUrl("/terms-of-service", locale)}
              className={styles["footer__legal-link"]}
            >
              Terms of Service
            </Link>
          </div>

          {/* Social Icons */}
          <div className={styles["footer__socials"]}>
            <a
              href="https://www.facebook.com/CapeCoralReviewed/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles["footer__social-link"]}
              aria-label="Facebook"
            >
              <Image
                src="/icons/facebook.svg"
                alt="Facebook"
                width={24}
                height={24}
              />
            </a>
            <a
              href="https://www.instagram.com/capecoralreviewed/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles["footer__social-link"]}
              aria-label="Instagram"
            >
              <Image
                src="/icons/instagram.svg"
                alt="Instagram"
                width={24}
                height={24}
              />
            </a>
            <a
              href="https://www.youtube.com/@CapeCoralReviewed"
              target="_blank"
              rel="noopener noreferrer"
              className={styles["footer__social-link"]}
              aria-label="YouTube"
            >
              <Image
                src="/icons/youtube.svg"
                alt="YouTube"
                width={24}
                height={24}
              />
            </a>
            <a
              href="https://www.tiktok.com/@capecoralreviewed"
              target="_blank"
              rel="noopener noreferrer"
              className={styles["footer__social-link"]}
              aria-label="TikTok"
            >
              <Image
                src="/icons/tiktok.svg"
                alt="TikTok"
                width={24}
                height={24}
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
