import prisma from "@/lib/prisma";
import styles from "./page.module.css";

export default async function InsightsDashboard() {
  const pulses = await prisma.pulseResponse.findMany({
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const totalAnomalies = await prisma.anomalyFlag.count();
  const totalLeaves = await prisma.leaveRequest.count({ where: { status: "PENDING" } });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>INSIGHTS</h1>
        <p className={styles.subtitle}>Team health, sentiment, and AI-driven metrics.</p>
      </header>

      <div className={styles.insightsGrid}>
        
        {/* Metric 1 */}
        <div className={`neo-panel ${styles.metricCard}`}>
          <div className={styles.metricIcon}>♥</div>
          <div className={styles.metricValue}>GOOD</div>
          <div className={styles.metricLabel}>AVG MOOD SCORE</div>
        </div>

        {/* Metric 2 */}
        <div className={`neo-panel ${styles.metricCard}`}>
          <div className={styles.metricIcon}>⚡</div>
          <div className={styles.metricValue}>{totalAnomalies}</div>
          <div className={styles.metricLabel}>ACTIVE ANOMALIES</div>
        </div>

        {/* Metric 3 */}
        <div className={`neo-panel ${styles.metricCard}`}>
          <div className={styles.metricIcon}>🏖</div>
          <div className={styles.metricValue}>{totalLeaves}</div>
          <div className={styles.metricLabel}>PENDING LEAVES</div>
        </div>

        {/* Pulse Sentiment List */}
        <div className={`neo-panel ${styles.listCard}`}>
          <h2 className={styles.cardTitle}>Recent Pulse Responses</h2>
          <div className={styles.pulseList}>
            {pulses.map(pulse => (
              <div key={pulse.id} className={styles.pulseItem}>
                <div className={styles.pulseEmp}>
                  <span className={styles.empName}>{pulse.employee.user.name}</span>
                  <span className={styles.pulseDate}>{pulse.date.toLocaleDateString()}</span>
                </div>
                <div className={styles.pulseMood}>{pulse.mood}</div>
              </div>
            ))}

            {pulses.length === 0 && (
              <p>No pulse data available yet.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
