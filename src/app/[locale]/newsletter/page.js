import React from "react";
import NewsletterHero from "@/components/newsletter/NewsletterHero";
import NewsletterFeatures from "@/components/newsletter/NewsletterFeatures";
import NewsletterShowcase from "@/components/newsletter/NewsletterShowcase";
import NewsletterTestimonial from "@/components/newsletter/NewsletterTestimonial";
import NewsletterFAQ from "@/components/newsletter/NewsletterFAQ";
import NewsletterForm from "@/components/newsletter/NewsletterForm";

export const metadata = {
  title: "Stay Connected: The Cape Coral Reviewed Weekly Newsletter",
  description: "Join the local community list. Get exclusive reviews, upcoming events, and business features delivered to your inbox.",
};

export default function NewsletterPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      <NewsletterHero />

      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Editorial Content */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          <NewsletterFeatures />
          <NewsletterShowcase />
          <NewsletterTestimonial />
          <NewsletterFAQ />
        </div>

        {/* Right Column: Sticky Conversion Form */}
        <div className="lg:col-span-4 order-first lg:order-last">
          <div className="sticky top-8 bg-[#231f20] p-8 rounded-2xl shadow-2xl">
            <h3 className="text-white text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
              Join the Local Insider List
            </h3>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Don't miss out on the best of Cape Coral. Sign up for free weekly updates.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>
    </main>
  );
}
