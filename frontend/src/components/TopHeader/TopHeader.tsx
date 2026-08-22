"use client";

import styles from "./TopHeader.module.css";
import Link from "next/link";

export default function TopHeader() {
  return (
    <header className={styles.topHeader}>
      <div className={styles.searchBox}>
        <span className={styles.searchIcon}>⌕</span>
        <input 
          type="text" 
          placeholder="Search employees, leave, payroll..." 
          className={styles.searchInput}
        />
        <div className={styles.cmdHint}>⌘ K</div>
      </div>

      <div className={styles.rightSection}>
        <button className={styles.iconBtn}>
          🔔
          <span className={styles.badge}>7</span>
        </button>
        <button className={styles.iconBtn}>
          📁
        </button>

        <Link href="/profile" className={styles.profileArea}>
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>Admin User</div>
            <div className={styles.profileRole}>HR Administrator</div>
          </div>
          <div className={styles.profileChevron}>▼</div>
        </Link>
      </div>
    </header>
  );
}
