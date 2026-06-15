import React from "react";
import Script from "next/script";
import styles from "./NewsletterFAQ.module.css";

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
    <section className={styles.faqSection}>
      <Script
        id="faq-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className={styles.faqContainer}>
        <div className={styles.faqHeader}>
          <h2 className={styles.faqMainTitle}>Frequently Asked Questions</h2>
        </div>
        <div className={styles.faqList}>
          {faqs.map((faq) => (
            <div key={faq.question} className={styles.faqItem}>
              <h3 className={styles.questionTitle}>{faq.question}</h3>
              <p className={styles.answerText}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
