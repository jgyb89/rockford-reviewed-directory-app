import React from "react";
import Script from "next/script";

export default function NewsletterFAQ() {
  const faqs = [
    {
      question: "Is the Cape Coral Reviewed newsletter free?",
      answer: "Yes! Our weekly roundups of Cape Coral events and news are 100% free for subscribers."
    },
    {
      question: "How often will I receive emails?",
      answer: "We send out one curated email every Thursday morning, just in time for you to plan your weekend in Cape Coral."
    },
    {
      question: "How can I feature my local business in the newsletter?",
      answer: "We love highlighting local gems! You can submit your business through our directory portal for a chance to be featured."
    }
  ];

  // Generate FAQPage JSON-LD Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section style={{ backgroundColor: "#fff", padding: "6rem 1.5rem" }}>
      {/* Inject Schema Markup */}
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <h2 style={{ fontSize: "2.5rem", fontWeight: "800", color: "#111", fontFamily: "var(--font-heading)" }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              style={{ 
                borderBottom: index !== faqs.length - 1 ? "1px solid #eaeaea" : "none",
                paddingBottom: index !== faqs.length - 1 ? "2rem" : "0"
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111", marginBottom: "1rem" }}>
                {faq.question}
              </h3>
              <p style={{ color: "#4a4a4a", lineHeight: "1.6", margin: 0 }}>
                {faq.answer}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
