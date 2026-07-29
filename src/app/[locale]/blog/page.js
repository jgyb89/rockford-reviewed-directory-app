/* src/app/blog/page.js */
import PropTypes from "prop-types";
import BlogView from "@/components/blog/BlogView";
import BlogSEO from "@/components/blog/BlogSEO"; // Import the new component
import { getBlogPosts } from "@/lib/actions";
import { getDictionary } from "@/lib/dictionaries";
import DOMPurify from "isomorphic-dompurify";
import { formatImageUrl } from "@/lib/formatImageUrl";
import styles from "./BlogPage.module.css";

export const metadata = {
  title: "Rockford News & Reviews | Blog",
  description:
    "Explore the latest news, reviews, and featured businesses in Rockford.",
};

export default async function BlogPage({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const posts = await getBlogPosts();
  
  const t = dict?.blog || {};

  const formattedPosts = posts.map((node) => ({
    id: node.databaseId,
    title: node.title,
    slug: node.slug,
    categories: node.categories.nodes.map((cat) => cat.name),
    categorySlugs: node.categories.nodes.map((cat) => cat.slug),
    imageUrl: formatImageUrl(node.featuredImage?.node?.sourceUrl),
    excerpt: node.excerpt
      ? DOMPurify.sanitize(node.excerpt, { ALLOWED_TAGS: [] })
      : "",
  }));

  return (
    <main className="blog-page">
      <div
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem 0" }}
      >
        <h1
          style={{
            fontFamily: "var(--font-heading)",
            fontSize: "clamp(2rem, 6vw, 3rem)",
            fontWeight: "800",
            marginBottom: "0.5rem",
            color: "var(--color-text)",
            lineHeight: "1.1",
          }}
        >
          {t.title || "Rockford News & Reviews"}
        </h1>
        <p className={styles.blogContent}>
          {t.subtitle ||
            "Stay up to date with the latest happenings, business spotlights, and local guides in the Rockford community."}
        </p>
      </div>
      
      {/* Dynamic Grid Layout */}
      <BlogView posts={formattedPosts} dict={dict} locale={locale} />
      
      {/* New Animated SEO Block */}
      <BlogSEO />
      
    </main>
  );
}

BlogPage.propTypes = {
  params: PropTypes.object.isRequired,
};
