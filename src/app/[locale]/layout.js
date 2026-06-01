import { poppins, openSans } from "@/app/fonts";
import PropTypes from "prop-types";
import "../globals.css";
import "material-symbols/outlined.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/common/Preloader";
import FabMenu from "@/components/common/FabMenu";
import CookieConsent from "@/components/common/CookieConsent";
import { getDictionary } from "@/lib/dictionaries";
import { BASE_URL } from "@/lib/constants";

import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

export async function generateMetadata() {
  return {
    metadataBase: new URL(BASE_URL),
    title: {
      template: "%s | Cape Coral Reviewed",
      default: "Cape Coral Reviewed",
    },
    description: "The premier local directory for Cape Coral, Florida.",
    icons: {
      icon: "/cape-coral-reviewed-icon.svg",
      apple: "/cape-coral-reviewed-icon.svg",
    },
  };
}

export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "es" }];
}

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <html lang={locale}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-TBEXLYNPDT"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TBEXLYNPDT');
          `}
        </Script>
      </head>
      <body className={`${poppins.variable} ${openSans.variable}`}>
        <Preloader />
        <Navbar currentUser={null} dict={dict} locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
        <FabMenu />
        <CookieConsent />
        <SpeedInsights />
      </body>
    </html>
  );
}

RootLayout.propTypes = {
  children: PropTypes.node.isRequired,
  params: PropTypes.object.isRequired,
};
