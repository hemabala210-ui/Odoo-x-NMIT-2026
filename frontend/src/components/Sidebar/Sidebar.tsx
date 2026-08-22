"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  const isNavActive = (path: string) => pathname.startsWith(path) ? styles.active : "";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoArea}>
        <div className={styles.logoIcon}>◈</div>
        <div className={styles.logoText}>
          <span className={styles.brandName}>DAYFLOW</span>
          <span className={styles.brandSub}>Human Operations Command System</span>
        </div>
      </div>

      <div className={styles.navSections}>
        
        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>Main Navigation</div>
          <Link href="/command-center" className={`${styles.navLink} ${isNavActive("/command-center")}`}>
            <span className={styles.navIcon}>⌂</span> Command Center
          </Link>
          <Link href="/people" className={`${styles.navLink} ${isNavActive("/people")}`}>
            <span className={styles.navIcon}>👥</span> People
          </Link>
          <Link href="/attendance" className={`${styles.navLink} ${isNavActive("/attendance")}`}>
            <span className={styles.navIcon}>⏱</span> Attendance
          </Link>
          <Link href="/leave" className={`${styles.navLink} ${isNavActive("/leave")}`}>
            <span className={styles.navIcon}>🏖</span> Time Off
          </Link>
          <Link href="/payroll" className={`${styles.navLink} ${isNavActive("/payroll")}`}>
            <span className={styles.navIcon}>💵</span> Payroll
          </Link>
          <Link href="/insights" className={`${styles.navLink} ${isNavActive("/insights")}`}>
            <span className={styles.navIcon}>📊</span> Insights
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>Intelligence</div>
          <Link href="/ai" className={`${styles.navLink} ${isNavActive("/ai")}`}>
            <span className={`${styles.navIcon} ${styles.iconAi}`}>✧</span> Dayflow AI
            <span className={styles.badge}>BETA</span>
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>System</div>
          <Link href="/settings" className={`${styles.navLink} ${isNavActive("/settings")}`}>
            <span className={styles.navIcon}>⚙</span> Settings
          </Link>
          <Link href="/integrations" className={`${styles.navLink} ${isNavActive("/integrations")}`}>
            <span className={styles.navIcon}>🔗</span> Integrations
          </Link>
          <Link href="/logs" className={`${styles.navLink} ${isNavActive("/logs")}`}>
            <span className={styles.navIcon}>📋</span> Audit Logs
          </Link>
        </div>

        <div className={styles.navSection}>
          <div className={styles.sectionTitle}>Quick Actions</div>
          <button className={styles.navLink}>
            <span className={`${styles.navIcon} ${styles.iconCheckIn}`}>⊙</span> Check In
          </button>
          <button className={styles.navLink}>
            <span className={`${styles.navIcon} ${styles.iconLeave}`}>⊕</span> Apply Leave
          </button>
          <Link href="/payroll" className={styles.navLink}>
            <span className={`${styles.navIcon} ${styles.iconPayslip}`}>📄</span> View Payslip
          </Link>
          <Link href="/people" className={styles.navLink}>
            <span className={`${styles.navIcon} ${styles.iconEmployees}`}>👥</span> All Employees
          </Link>
        </div>

      </div>

      <div className={styles.profileArea}>
        <div className={styles.avatar}>A</div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>Admin User</div>
          <div className={styles.profileRole}>HR Administrator</div>
        </div>
        <div className={styles.profileDots}>⋮</div>
      </div>

    </aside>
  );
}
