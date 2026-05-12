/* src/components/blog/BlogCard.js */
"use client";

import Image from "next/image";
import Link from "next/link";
import { getLocalizedUrl } from "@/lib/constants";
import styles from "./Blog.module.css";

export default function BlogCard({ post, locale = "en" }) {
  const { title, categories, excerpt, slug, imageUrl } = post;

  return (
    <article className={styles['blog-card']}>
      <div className={styles['blog-card__image-wrapper']}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          style={{ objectFit: "cover" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className={styles['blog-card__content']}>
        <div className={styles['blog-card__categories']}>{categories.join(", ")}</div>
        <h3 className={styles['blog-card__title']}>{title}</h3>
        <p className={styles['blog-card__excerpt']}>{excerpt}</p>
        <Link href={getLocalizedUrl(`/blog/${slug}`, locale)} className={styles['blog-card__read-more']}>
          Read More &rarr;
        </Link>
      </div>
    </article>
  );
}
