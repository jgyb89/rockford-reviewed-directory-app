"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import LoginModal from "@/components/auth/LoginModal";
import { getDictionary } from "@/lib/dictionaries";

export default function CheckEmailPage() {
  const params = useParams();
  const locale = params.locale || "en";
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [dict, setDict] = useState(null);

  useEffect(() => {
    getDictionary(locale).then(setDict);
  }, [locale]);

  const t = dict?.checkEmail || {};

  return (
    <div className="check-email">
      <div className="check-email__container">
        <h1 className="check-email__title">{t.title || "Check Your Inbox!"}</h1>
        <p className="check-email__message">
          {t.message || "We've sent a verification link to your email address. Please click the link to activate your account and access your dashboard."}
        </p>
        <div className="check-email__actions">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="check-email__button"
            style={{ border: "none", cursor: "pointer" }}
          >
            {t.loginButton || "Go to Login"}
          </button>
          <Link href={``} className="check-email__link">
            {t.returnHome || "Return to Homepage"}
          </Link>
        </div>
      </div>

      <Suspense fallback={null}>
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          dict={dict}
          locale={locale}
        />
      </Suspense>
    </div>
  );
}
