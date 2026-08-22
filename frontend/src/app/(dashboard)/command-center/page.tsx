import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";

export default async function CommandCenter() {
  // Fetch real data for ORGANIZATION PULSE
  const totalEmployees = await prisma.employee.count();
  
  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { employee: { include: { user: true } } },
    orderBy: { startDate: 'asc' }
  });
  
  const anomalies = await prisma.anomalyFlag.findMany({
    where: { resolvedBool: false },
    include: { employee: { include: { user: true } } },
    orderBy: { detectedAt: 'desc' }
  });

  // Calculate simple Attendance Health
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const attendanceToday = await prisma.attendance.count({
    where: { date: { gte: today } }
  });
  
  const attendanceHealth = totalEmployees > 0 
    ? Math.round((attendanceToday / totalEmployees) * 100) 
    : 0;

  // Combine events for ATTENTION STREAM (Anomalies + Pending Leaves)
  // In a real app we'd unify this in SQL, but here we can merge arrays in JS
  const streamEvents = [
    ...anomalies.map(a => ({
      id: `anom-${a.id}`,
      type: 'ANOMALY',
      title: a.employee.user.name,
      desc: a.deviation,
      time: new Date(a.detectedAt),
      action: 'REVIEW',
      link: `/people/${a.employeeId}`
    })),
    ...pendingLeaves.map(l => ({
      id: `leave-${l.id}`,
      type: 'LEAVE',
      title: l.employee.user.name,
      desc: `${l.type} Request (${l.durationDays} days)`,
      time: new Date(l.createdAt),
      action: 'APPROVE',
      link: '/leave'
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6);

  // Deterministic DAYFLOW ANALYSIS
  const anomalyCount = anomalies.length;
  let statement = "Organization operating within normal parameters.";
  let why = "No significant deviations detected.";
  let impact = "Nominal";
  let recAction = "Continue standard operations.";
  let signalClass = styles.signalInfo;

  if (anomalyCount > 3) {
    statement = "Elevated anomaly detection rate across departments.";
    why = `${anomalyCount} unresolved attendance deviations.`;
    impact = "Moderate operational drag";
    recAction = "Review and clear pending anomalies immediately.";
    signalClass = styles.signalWarning;
  } else if (pendingLeaves.length > 5) {
    statement = "Leave approval backlog accumulating.";
    why = `${pendingLeaves.length} pending time-off requests.`;
    impact = "Scheduling uncertainty";
    recAction = "Process leave pipeline.";
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>INTELLIGENCE CENTER</h1>
        <p className={styles.subtitle}>System status and human operations overview.</p>
      </header>

      {/* ORGANIZATION PULSE */}
      <section className={styles.pulseSection}>
        <div className={styles.sectionHeader}>
          <div className={`${styles.signalDot} ${anomalyCount > 0 ? 'signal-warning' : 'signal-success'}`}></div>
          <span className={styles.sectionTitle}>ORGANIZATION PULSE</span>
        </div>
        
        <div className={styles.metricsRow}>
          <div className={`spatial-panel ${styles.metricCard}`}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>HEADCOUNT</span>
            </div>
            <div className={styles.metricValue}>{totalEmployees}</div>
          </div>
          
          <div className={`spatial-panel ${styles.metricCard}`}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>ATTENDANCE HEALTH</span>
              {attendanceHealth < 80 && <div className="signal-dot signal-warning"></div>}
            </div>
            <div className={styles.metricValue}>{attendanceHealth}%</div>
          </div>
          
          <div className={`spatial-panel ${styles.metricCard}`}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>PENDING LEAVE</span>
              {pendingLeaves.length > 0 && <div className="signal-dot signal-info"></div>}
            </div>
            <div className={styles.metricValue}>{pendingLeaves.length}</div>
          </div>
          
          <div className={`spatial-panel ${styles.metricCard}`}>
            <div className={styles.metricHeader}>
              <span className={styles.metricLabel}>ACTIVE ANOMALIES</span>
              {anomalyCount > 0 && <div className="signal-dot signal-critical"></div>}
            </div>
            <div className={styles.metricValue} style={{ color: anomalyCount > 0 ? 'var(--status-critical)' : 'inherit' }}>
              {anomalyCount}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.mainGrid}>
        {/* DAYFLOW ANALYSIS */}
        <div className={styles.leftCol}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>DAYFLOW ANALYSIS</span>
          </div>
          
          <div className={`spatial-panel-raised ${styles.insightCard}`}>
            <div className={styles.insightHeader}>
              <span className={styles.insightTag}>SYSTEM INSIGHT</span>
            </div>
            
            <div className={styles.insightStatement}>
              {statement}
            </div>
            
            <div className={styles.insightGrid}>
              <div className={styles.insightBlock}>
                <span className={styles.insightLabel}>WHY</span>
                <span className={styles.insightValue}>{why}</span>
              </div>
              <div className={styles.insightBlock}>
                <span className={styles.insightLabel}>IMPACT</span>
                <span className={styles.insightValue}>{impact}</span>
              </div>
              <div className={styles.insightBlock}>
                <span className={styles.insightLabel}>RECOMMENDED ACTION</span>
                <span className={`${styles.insightValue} ${styles.insightAction}`}>{recAction}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENTION STREAM */}
        <div className={styles.rightCol}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>ATTENTION STREAM</span>
          </div>
          
          <div className={`spatial-panel ${styles.streamList}`}>
            {streamEvents.length === 0 ? (
              <div className={styles.emptyState}>No items require attention.</div>
            ) : (
              streamEvents.map(event => (
                <div key={event.id} className={styles.streamItem}>
                  <div className={styles.streamTime}>
                    {event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                  <div className={styles.streamContent}>
                    <div className={styles.streamTitle}>
                      {event.type === 'ANOMALY' && <span style={{color: 'var(--status-critical)', marginRight: 4}}>⚠</span>}
                      {event.title}
                    </div>
                    <div className={styles.streamDesc}>{event.desc}</div>
                  </div>
                  <Link href={event.link} className={styles.streamAction}>
                    {event.action}
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
