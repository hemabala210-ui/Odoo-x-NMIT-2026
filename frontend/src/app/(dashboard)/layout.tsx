import TopNav from "@/components/TopNav/TopNav";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.dashboardLayout}>
      <TopNav />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
