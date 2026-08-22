"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const Icons = {
  Home: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>,
  Users: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  Clock: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Calendar: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
  Banknotes: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V5.245c0-.754-.726-1.294-1.453-1.096a60.07 60.07 0 01-15.797 2.101c-.727.198-1.453.342-1.453 1.096v11.309c0 .754.726 1.294 1.453 1.096zM15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Chart: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  Sparkles: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${styles.navIcon} ${styles.iconAi}`}><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>,
  Cog: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0115 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" /></svg>,
  Link: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
  Document: () => <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.navIcon}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
};

export default function Sidebar() {
  const pathname = usePathname();

  const isNavActive = (path: string) => {
    return pathname === path ? styles.navLinkActive : "";
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        
        {/* LOGO SECTION */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>◈</div>
          <div className={styles.logoText}>
            <div className={styles.logoTitle}>DAYFLOW</div>
            <div className={styles.logoSub}>HUMAN OPERATIONS COMMAND SYSTEM</div>
          </div>
        </div>

        {/* NAVIGATION SECTIONS */}
        <div className={styles.navScrollArea}>
          
          <div className={styles.navSection}>
            <div className={styles.sectionTitle}>Main Navigation</div>
            <Link href="/command-center" className={`${styles.navLink} ${isNavActive("/command-center")}`}>
              <Icons.Home /> Command Center
            </Link>
            <Link href="/people" className={`${styles.navLink} ${isNavActive("/people")}`}>
              <Icons.Users /> People
            </Link>
            <Link href="/attendance" className={`${styles.navLink} ${isNavActive("/attendance")}`}>
              <Icons.Clock /> Attendance
            </Link>
            <Link href="/leave" className={`${styles.navLink} ${isNavActive("/leave")}`}>
              <Icons.Calendar /> Time Off
            </Link>
            <Link href="/payroll" className={`${styles.navLink} ${isNavActive("/payroll")}`}>
              <Icons.Banknotes /> Payroll
            </Link>
            <Link href="/insights" className={`${styles.navLink} ${isNavActive("/insights")}`}>
              <Icons.Chart /> Insights
            </Link>
          </div>

          <div className={styles.navSection}>
            <div className={styles.sectionTitle}>Intelligence</div>
            <Link href="/ai" className={`${styles.navLink} ${isNavActive("/ai")}`}>
              <Icons.Sparkles /> Dayflow AI
              <span className={styles.badge}>BETA</span>
            </Link>
          </div>

          <div className={styles.navSection}>
            <div className={styles.sectionTitle}>System</div>
            <Link href="/settings" className={`${styles.navLink} ${isNavActive("/settings")}`}>
              <Icons.Cog /> Settings
            </Link>
            <Link href="/integrations" className={`${styles.navLink} ${isNavActive("/integrations")}`}>
              <Icons.Link /> Integrations
            </Link>
            <Link href="/logs" className={`${styles.navLink} ${isNavActive("/logs")}`}>
              <Icons.Document /> Audit Logs
            </Link>
          </div>

        </div>

        {/* BOTTOM AREA (Quick Actions + Profile) */}
        <div className={styles.bottomArea}>
          <div className={styles.navSection}>
            <div className={styles.sectionTitle}>Quick Actions</div>
            <div className={styles.quickActionsGrid}>
              <button className={styles.quickBtn}>
                <Icons.Clock /> Check In
              </button>
              <button className={styles.quickBtn}>
                <Icons.Calendar /> Apply Leave
              </button>
            </div>
          </div>
        </div>

      </div>
    </aside>
  );
}
