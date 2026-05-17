import PropTypes from "prop-types";
import { notFound } from "next/navigation";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import parse from "html-react-parser";
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

  const rawContent = post.content || "";
  // Extract valid video src URLs and swap the entire iframe for a safe div placeholder
  const contentWithSafePlaceholders = rawContent.replace(
    /<iframe[^>]*src="(https:\/\/(?:www\.)?(?:youtube\.com|youtu\.be|player\.vimeo\.com|tiktok\.com)[^"]*)"[^>]*>[\s\S]*?<\/iframe>/gi,
    '<div class="secure-video-embed" data-src="$1"></div>'
  );

  const sanitizedContent = DOMPurify.sanitize(contentWithSafePlaceholders, {
    ADD_TAGS: ["video", "source", "track"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "frameborder",
      "scrolling",
      "src",
      "type",
      "controls",
      "autoplay",
      "muted",
      "loop",
      "playsinline",
      "poster",
    ],
  });

  const parseOptions = {
    replace: (domNode) => {
      if (domNode.name === 'div' && domNode.attribs?.class === 'secure-video-embed') {
        const src = domNode.attribs['data-src'];
        
        // Smart Detection: Check if the URL belongs to a portrait-first platform/format
        const isPortrait = src.includes('shorts') || src.includes('tiktok');

        return (
          <div style={{ marginBottom: '2.5rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <iframe
              src={src}
              style={{
                width: '100%',
                // Cap portrait videos at a realistic phone width, allow landscape to be wider
                maxWidth: isPortrait ? '400px' : '800px', 
                // Your requested minimum height fallback
                minHeight: '450px', 
                borderRadius: '12px',
                backgroundColor: '#000',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
              }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              title="Video Embed"
            />
          </div>
        );
      }
    }
  };

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

        <div className="blog-post__content">
          {parse(sanitizedContent, parseOptions)}
        </div>
      </article>

      <BlogSidebar locale={locale} />
    </div>
  );
}

BlogPostPage.propTypes = {
  params: PropTypes.object.isRequired,
};
