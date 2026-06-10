import React from "react";
import NewsletterHero from "@/components/newsletter/NewsletterHero";
import NewsletterFeatures from "@/components/newsletter/NewsletterFeatures";
import NewsletterSneakPeek from "@/components/newsletter/NewsletterSneakPeek";
import NewsletterTestimonial from "@/components/newsletter/NewsletterTestimonial";
import NewsletterFAQ from "@/components/newsletter/NewsletterFAQ";

export const metadata = {
  title: "Cape Coral Newsletter: Local Events, News & Best Restaurants | CCR",
  description: "Discover the best of Cape Coral, FL! Subscribe to our weekly newsletter for exclusive local events, restaurant reviews, and community news delivered to your inbox.",
};

export default function NewsletterPage() {
  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      <NewsletterHero />
      <NewsletterFeatures />
      <NewsletterSneakPeek />
      <NewsletterTestimonial />
      <NewsletterFAQ />
    </main>
  );
}
