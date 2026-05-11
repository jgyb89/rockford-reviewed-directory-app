/* src/app/blog/page.js */
import PropTypes from "prop-types";
import BlogView from "@/components/blog/BlogView";
import { getBlogPosts } from "@/lib/actions";
import { getDictionary } from "@/lib/dictionaries";
import DOMPurify from "isomorphic-dompurify";
import { formatImageUrl } from "@/lib/formatImageUrl";

export const metadata = {
  title: "Cape Coral News & Reviews | Blog",
  description: "Explore the latest news, reviews, and featured businesses in Cape Coral.",
};

export default async function BlogPage({ params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const posts = await getBlogPosts();

  const t = dict?.blog || {};

  const formattedPosts = posts.map(node => ({
    id: node.databaseId,
    title: node.title,
    slug: node.slug,
    categories: node.categories.nodes.map(cat => cat.name),
    categorySlugs: node.categories.nodes.map(cat => cat.slug),
    imageUrl: formatImageUrl(node.featuredImage?.node?.sourceUrl),
    excerpt: node.excerpt ? DOMPurify.sanitize(node.excerpt, { ALLOWED_TAGS: [] }) : ""
  }));

  return (
    <main className="blog-page">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem 0' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-heading)', 
          fontSize: 'clamp(2rem, 6vw, 3rem)', 
          fontWeight: '800', 
          marginBottom: '0.5rem',
          color: 'var(--color-text)',
          lineHeight: '1.1'
        }}>
          {t.title || "Cape Coral News & Reviews"}
        </h1>
        <p style={{ 
          fontSize: 'clamp(1rem, 3vw, 1.25rem)', 
          color: '#4a5568', 
          maxWidth: '800px', 
          marginBottom: '1.5rem',
          lineHeight: '1.4' 
        }}>
          {t.subtitle || "Stay up to date with the latest happenings, business spotlights, and local guides in the Cape Coral community."}
        </p>
      </div>
      
      <BlogView posts={formattedPosts} dict={dict} locale={locale} />
    </main>
  );
}

BlogPage.propTypes = {
  params: PropTypes.object.isRequired,
};
