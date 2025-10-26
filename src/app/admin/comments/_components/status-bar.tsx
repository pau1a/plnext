
import styles from "./status-bar.module.scss";

interface StatusBarProps {
  status: "pending" | "approved" | "rejected" | "spam";
}

export function StatusBar({ status }: StatusBarProps) {
  return <div className={`${styles.statusBar} ${styles[status]}`} />;
}
