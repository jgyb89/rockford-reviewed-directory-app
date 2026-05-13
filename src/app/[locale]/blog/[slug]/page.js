import PropTypes from "prop-types";
import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import { getBlogPostBySlug } from "@/lib/actions";
import { formatImageUrl } from "@/lib/formatImageUrl";
import BlogSidebar from "@/components/blog/BlogSidebar";
import BackButton from "@/components/blog/BackButton";
import "./BlogPost.css";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found | Cape Coral News",
    };
  }

  return {
    title: post.seo?.title || `${post.title} | Cape Coral News`,
    description:
      post.seo?.metaDesc || "Read more about this story on Cape Coral News.",
  };
}

export default async function BlogPostPage({ params }) {
  const { slug, locale } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const categoriesString = post.categories?.nodes
    ?.map((cat) => cat.name)
    .join(", ");

  const sanitizedContent = DOMPurify.sanitize(post.content || "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.featuredImage?.node?.sourceUrl 
      ? [formatImageUrl(post.featuredImage.node.sourceUrl)] 
      : [],
    datePublished: post.date,
    dateModified: post.modified || post.date,
  };

  return (
    <div className="blog-post-layout">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="blog-post-main">
        <BackButton />
        <header className="blog-post__header">
          <div className="blog-post__meta">
            {categoriesString && (
              <span className="blog-post__categories">{categoriesString}</span>
            )}
            {categoriesString && <span className="blog-post__divider">•</span>}
            <time className="blog-post__date">{formattedDate}</time>
          </div>
          <h1
            style={{ fontSize: "2.5rem", fontWeight: "800", lineHeight: "1.2" }}
          >
            {post.title}
          </h1>
        </header>

        {post.featuredImage?.node?.sourceUrl && (
          <div className="blog-post__featured-image" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', overflow: 'hidden', borderRadius: '12px', marginBottom: '2rem' }}>
            <Image
              src={formatImageUrl(post.featuredImage.node.sourceUrl)}
              alt={post.featuredImage.node.altText || post.title}
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        )}

        <div
          className="blog-post__content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </article>

      <BlogSidebar locale={locale} />
    </div>
  );
}

BlogPostPage.propTypes = {
  params: PropTypes.object.isRequired,
};
