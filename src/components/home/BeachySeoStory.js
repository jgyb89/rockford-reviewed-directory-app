"use client";

import SeoIntro from "./SeoIntro";
import SeoMiddle from "./SeoMiddle";
import SeoEnd from "./SeoEnd";
import styles from "./BeachySeoStory.module.css";
import SeoCommunity from "./SeoCommunity";

export default function BeachySeoStory() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.contentMaxWidth}>
        <SeoIntro />
        <SeoMiddle />
        <SeoEnd />
        <SeoCommunity />
      </div>
    </section>
  );
}
