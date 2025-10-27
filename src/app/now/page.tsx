import { MDXRemote } from "next-mdx-remote/rsc";

import { formatDate } from "@/lib/date";
import { getNow } from "@/lib/now";
import { renderMarkdown } from "@/lib/stream";

import styles from "./now.module.scss";

export const metadata = {
  title: "Now | Paula Livingstone",
  description: "Paula Livingstone's current professional and learning focus.",
};

export const dynamic = "force-static";

export default async function NowPage() {
  const nowData = await getNow();
  const { meta, content } = nowData;

  return (
    <article className={styles.nowPage}>
      <header className={styles.header}>
        <h1 className={styles.title}>Now</h1>
        {meta.updated ? (
          <time className={styles.updated} dateTime={meta.updated as string}>
            Updated {formatDate(String(meta.updated))}
          </time>
        ) : null}
      </header>
      <div className={`${styles.content} prose`}>
        {nowData.type === "stream" ? (
          await renderMarkdown(content)
        ) : (
          <MDXRemote source={content} />
        )}
      </div>
    </article>
  );
}
