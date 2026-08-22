import prisma from "@/lib/prisma";
import styles from "./page.module.css";

export default async function Insights() {
  // Fetch real data for Insights
  const anomalies = await prisma.anomalyFlag.findMany();
  const leaves = await prisma.leaveRequest.findMany();
  const pulses = await prisma.pulseResponse.findMany();
  
  // 1. Process Anomalies
  const anomalyCounts = anomalies.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 2. Process Leaves
  const leaveCounts = leaves.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalLeaves = leaves.length || 1; // avoid div by 0

  // 3. Process Pulses (Mood)
  const moodCounts = pulses.reduce((acc, curr) => {
    acc[curr.mood] = (acc[curr.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const totalPulses = pulses.length || 1;

  // Mock data for the big line chart (Operational Velocity)
  const linePoints = "0,150 50,130 100,140 150,90 200,110 250,60 300,80 350,40 400,20";
  const polygonPoints = `0,200 ${linePoints} 400,200`;

  // Calculate SVG Donut dashes
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  
  const leaveData = [
    { label: "SICK", count: leaveCounts["SICK"] || 0, color: "var(--status-critical)" },
    { label: "VACATION", count: leaveCounts["VACATION"] || 0, color: "var(--status-success)" },
    { label: "UNPAID", count: leaveCounts["UNPAID"] || 0, color: "var(--status-warning)" },
    { label: "OTHER", count: leaveCounts["OTHER"] || 0, color: "var(--accent-primary)" },
  ];

  let currentOffset = 0;
  const leaveDonut = leaveData.map(d => {
    const dash = (d.count / totalLeaves) * circumference;
    const strokeDasharray = `${dash} ${circumference - dash}`;
    const strokeDashoffset = -currentOffset;
    currentOffset += dash;
    return { ...d, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>INTELLIGENCE INSIGHTS</h1>
        <p className={styles.subtitle}>System-wide telemetry and workforce operational metrics.</p>
      </header>

      <div className={styles.grid}>
        
        {/* OPERATIONAL VELOCITY (Line Chart) */}
        <div className={`spatial-panel-raised ${styles.fullWidth}`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>OPERATIONAL VELOCITY (30 DAY TREND)</h2>
          </div>
          <svg className={styles.chartSvg} viewBox="0 0 400 200" preserveAspectRatio="none">
            <defs>
              <linearGradient id="velocityFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            
            <line x1="0" y1="50" x2="400" y2="50" className={styles.chartGrid} />
            <line x1="0" y1="100" x2="400" y2="100" className={styles.chartGrid} />
            <line x1="0" y1="150" x2="400" y2="150" className={styles.chartGrid} />
            
            <polygon points={polygonPoints} fill="url(#velocityFill)" />
            <polyline points={linePoints} className={styles.chartLine} />
            <circle cx="400" cy="20" r="4" className={styles.chartPoint} />
          </svg>
        </div>

        {/* SYSTEM ANOMALIES (Bar Chart) */}
        <div className="spatial-panel-raised">
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>SYSTEM ANOMALIES BY TYPE</h2>
          </div>
          <div className={styles.barChart}>
            {Object.entries(anomalyCounts).length === 0 && <p className={styles.subtitle}>No anomalies detected.</p>}
            {Object.entries(anomalyCounts).map(([type, count]) => {
              const max = Math.max(...Object.values(anomalyCounts));
              const pct = max > 0 ? (count / max) * 100 : 0;
              return (
                <div className={styles.barChartRow} key={type}>
                  <div className={styles.barLabel}>{type.replace("_", " ")}</div>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${pct}%`, background: 'var(--status-warning)' }}></div>
                  </div>
                  <div className={styles.barValue}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEAVE DISTRIBUTION (Donut Chart) */}
        <div className="spatial-panel-raised">
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>TIME OFF DISTRIBUTION</h2>
          </div>
          <div className={styles.donutContainer}>
            <svg className={styles.donutSvg} viewBox="0 0 160 160">
              <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--surface-base)" strokeWidth="16" />
              {leaveDonut.map((d, i) => (
                <circle 
                  key={i}
                  cx="80" 
                  cy="80" 
                  r={radius} 
                  className={styles.donutSegment}
                  stroke={d.color}
                  strokeDasharray={d.strokeDasharray}
                  strokeDashoffset={d.strokeDashoffset}
                />
              ))}
            </svg>
            <div className={styles.donutLegend}>
              {leaveData.map((d, i) => (
                <div key={i} className={styles.legendItem}>
                  <div className={styles.legendColor} style={{ background: d.color }}></div>
                  <div className={styles.legendLabel}>{d.label}</div>
                  <div className={styles.legendValue}>{d.count}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
