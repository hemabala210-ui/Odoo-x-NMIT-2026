import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";

export default async function FlowPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const anomalyId = query.anomalyId as string | undefined;

  const anomalies = await prisma.anomalyFlag.findMany({
    where: { resolvedBool: false },
    include: { employee: { include: { user: true } } },
    orderBy: { detectedAt: "desc" },
  });

  const activeAnomaly = anomalyId ? anomalies.find(a => a.id === anomalyId) : anomalies[0];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>FLOW MONITORING</h1>
        <p className={styles.subtitle}>
          Real-time attendance anomalies and "WHY?" explainability.
        </p>
      </header>

      <div className={styles.splitLayout}>
        {/* Left Column: Feed */}
        <div className={`neo-panel ${styles.feedColumn}`}>
          <h2 className={styles.sectionTitle}>DETECTED ANOMALIES</h2>
          
          <div className={styles.anomalyList}>
            {anomalies.map(anomaly => {
              const isActive = activeAnomaly?.id === anomaly.id;
              
              return (
                <Link 
                  href={`/flow?anomalyId=${anomaly.id}`} 
                  key={anomaly.id}
                  className={`${styles.anomalyItem} ${isActive ? styles.activeItem : ""}`}
                >
                  <div className={styles.itemHeader}>
                    <span className={styles.itemEmp}>{anomaly.employee.user.name}</span>
                    <span className={styles.itemTime}>
                      {new Date(anomaly.detectedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className={styles.itemDesc}>
                    {anomaly.deviation || anomaly.type}
                  </div>
                </Link>
              );
            })}
            
            {anomalies.length === 0 && (
              <p className={styles.empty}>No anomalies detected today.</p>
            )}
          </div>
        </div>

        {/* Right Column: "WHY?" Explainability */}
        <div className={styles.detailColumn}>
          {activeAnomaly ? (
            <div className={`neo-panel ${styles.explainCard}`}>
              <div className={styles.explainHeader}>
                <span className={styles.explainBadge}>AI ANALYSIS</span>
                <h3 className={styles.explainTitle}>Why was this flagged?</h3>
              </div>
              
              <div className={styles.factList}>
                <div className={styles.fact}>
                  <div className={styles.factPoint}></div>
                  <div className={styles.factContent}>
                    <span className={styles.factSubject}>{activeAnomaly.employee.user.name}</span> clocked in at {activeAnomaly.actualValue}.
                  </div>
                </div>
                <div className={styles.fact}>
                  <div className={styles.factPoint}></div>
                  <div className={styles.factContent}>
                    Expected arrival time is {activeAnomaly.expectedValue} based on shift policy.
                  </div>
                </div>
                <div className={styles.fact}>
                  <div className={styles.factPoint}></div>
                  <div className={styles.factContent}>
                    This is the <span className={styles.highlight}>3rd consecutive Monday</span> this employee has arrived late.
                  </div>
                </div>
                <div className={styles.fact}>
                  <div className={styles.factPoint}></div>
                  <div className={styles.factContent}>
                    Confidence Score: {(activeAnomaly.confidence || 0.92) * 100}%
                  </div>
                </div>
              </div>
              
              <div className={styles.contextBox}>
                <span className={styles.contextLabel}>System Context:</span>
                There are no approved leave requests or shift swaps for this period. A pattern is emerging.
              </div>

              <div className={styles.actions}>
                <button className={styles.btnPrimary}>Acknowledge & Notify Manager</button>
                <button className={styles.btnSecondary}>Dismiss</button>
              </div>
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              Select an anomaly to view the Explainable AI context.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
