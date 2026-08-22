import styles from "./page.module.css";
import Link from "next/link";
import { resilientFetch } from "@/lib/api";

type DashboardData = {
  totalEmployees: number;
  workingToday: number;
  pendingLeaves: any[];
  anomalies: any[];
  unresolvedAnomalies: number;
  payrollChanges: any[];
};

export default async function CommandCenter() {
  // Fetch real data from the Backend API utilizing auto-healing/retries
  let dashboardData: DashboardData | null = null;
  let apiError = false;

  try {
    dashboardData = await resilientFetch<DashboardData>('/dashboard');
  } catch (error) {
    console.error("Failed to fetch dashboard data:", error);
    apiError = true;
  }

  if (apiError || !dashboardData) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heroTitle}>TODAY'S HR COMMAND CENTER</h1>
        <p className={styles.subtitle}>Error loading data from the API. The system attempted to self-heal but the backend is unreachable.</p>
      </div>
    );
  }

  const {
    totalEmployees,
    workingToday,
    pendingLeaves,
    anomalies,
    unresolvedAnomalies,
    payrollChanges,
  } = dashboardData;

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.heroTitle}>TODAY'S HR COMMAND CENTER</h1>
        <p className={styles.subtitle}>Good morning, Admin.</p>
      </header>

      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{workingToday || totalEmployees}</span>
          <span className={styles.statLabel}>Employees currently working</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{pendingLeaves.length}</span>
          <span className={styles.statLabel}>Leave requests waiting</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{payrollChanges.length}</span>
          <span className={styles.statLabel}>Payroll change requires review</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{unresolvedAnomalies}</span>
          <span className={styles.statLabel}>Attendance anomalies detected</span>
        </div>
      </section>

      <section className={styles.attentionSection}>
        <h2 className={styles.sectionTitle}>
          ⚠ NEEDS YOUR ATTENTION
        </h2>

        <div className={styles.attentionList}>
          {anomalies.map((anomaly) => (
            <div key={anomaly.id} className={styles.attentionItem}>
              <div className={styles.attentionDetails}>
                <div className={`${styles.indicator} ${styles.red}`} />
                <div>
                  <div className={styles.employeeName}>{anomaly.employee.user.name}</div>
                  <div className={styles.issueDesc}>{anomaly.deviation || "Anomaly detected"}</div>
                </div>
              </div>
              <div className={styles.actions}>
                <Link href={`/flow?anomalyId=${anomaly.id}`} className={styles.btn}>
                  [WHY?]
                </Link>
                <button className={styles.btn}>Review</button>
              </div>
            </div>
          ))}

          {pendingLeaves.map((leave) => (
            <div key={leave.id} className={styles.attentionItem}>
              <div className={styles.attentionDetails}>
                <div className={`${styles.indicator} ${styles.yellow}`} />
                <div>
                  <div className={styles.employeeName}>{leave.employee.user.name}</div>
                  <div className={styles.issueDesc}>
                    Leave request • {leave.type} • {new Date(leave.startDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <Link href={`/leave/${leave.id}`} className={styles.btn}>Review Impact</Link>
                <button className={styles.btnPrimary}>Approve</button>
              </div>
            </div>
          ))}

          {payrollChanges.map((change) => (
            <div key={change.id} className={styles.attentionItem}>
              <div className={styles.attentionDetails}>
                <div className={`${styles.indicator} ${styles.blue}`} />
                <div>
                  <div className={styles.employeeName}>{change.payroll.employee.user.name}</div>
                  <div className={styles.issueDesc}>
                    Salary changed: {change.fieldChanged} modified from ₹{change.oldValue} → ₹{change.newValue}
                  </div>
                </div>
              </div>
              <div className={styles.actions}>
                <Link href={`/payroll/${change.payroll.employeeId}`} className={styles.btn}>[WHY?]</Link>
                <button className={styles.btn}>Review</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
