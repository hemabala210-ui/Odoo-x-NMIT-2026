"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { label: "Command Center", path: "/command-center", number: "01" },
  { label: "People", path: "/people", number: "02" },
  { label: "Flow", path: "/flow", number: "03" },
  { label: "Leave", path: "/leave", number: "04" },
  { label: "Payroll", path: "/payroll", number: "05" },
  { label: "Insights", path: "/insights", number: "06" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandMark}>◈</span>
        DAYFLOW
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <span className={styles.navNumber}>{item.number}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className={styles.divider} />

      <nav className={styles.bottomNav}>
        <Link
          href="/intelligence"
          className={`${styles.navItem} ${
            pathname.startsWith("/intelligence") ? styles.active : ""
          }`}
        >
          <span className={styles.navNumber}>◈</span>
          Intelligence
        </Link>
        <Link
          href="/settings"
          className={`${styles.navItem} ${
            pathname.startsWith("/settings") ? styles.active : ""
          }`}
        >
          <span className={styles.navNumber}>⚙</span>
          Settings
        </Link>
      </nav>
    </aside>
  );
}
