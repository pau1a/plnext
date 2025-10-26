
import styles from "./comment-list-loading.module.scss";

export function CommentListLoading() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title} />
        <div className={styles.actions} />
      </div>
      <div className={styles.list}>
        {[...Array(5)].map((_, i) => (
          <div className={styles.item} key={i}>
            <div className={styles.author} />
            <div className={styles.body} />
          </div>
        ))}
      </div>
    </div>
  );
}
