"use client";

import styles from "./TopHeader.module.css";
import Link from "next/link";

const Icons = {
  Search: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.searchIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  Bell: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.iconSvg}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  Folder: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.iconSvg}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>,
  ChevronDown: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={styles.profileChevron}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>,
};

export default function TopHeader() {
  return (
    <header className={styles.topHeader}>
      <div className={styles.searchBox}>
        <Icons.Search />
        <input 
          type="text" 
          placeholder="Search employees, leave, payroll..." 
          className={styles.searchInput}
        />
        <div className={styles.cmdHint}>⌘ K</div>
      </div>

      <div className={styles.rightSection}>
        <button className={styles.iconBtn}>
          <Icons.Bell />
          <span className={styles.badge}>7</span>
        </button>
        <button className={styles.iconBtn}>
          <Icons.Folder />
        </button>

        <Link href="/profile" className={styles.profileArea}>
          <div className={styles.avatar}>A</div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>Admin User</div>
            <div className={styles.profileRole}>HR Administrator</div>
          </div>
          <Icons.ChevronDown />
        </Link>
      </div>
    </header>
  );
}
