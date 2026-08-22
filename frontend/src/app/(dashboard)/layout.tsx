import Sidebar from "@/components/Sidebar/Sidebar";
import TopHeader from "@/components/TopHeader/TopHeader";
import styles from "./layout.module.css";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.appShell}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        <TopHeader />
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
}
