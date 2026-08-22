import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";
import LiveClock from "./LiveClock";

export default async function CommandCenter() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 1. TOP METRICS
  const totalEmployees = await prisma.employee.count();
  
  const presentToday = await prisma.attendance.count({
    where: { date: { gte: today, lt: tomorrow }, status: "PRESENT" }
  });

  const lateArrivals = await prisma.anomalyFlag.count({
    where: { detectedAt: { gte: today, lt: tomorrow }, type: "LATE_ARRIVAL" }
  });

  const onLeave = await prisma.leaveRequest.count({
    where: { status: "APPROVED", startDate: { lte: today }, endDate: { gte: today } }
  });

  const absent = Math.max(0, totalEmployees - presentToday - onLeave);
  const healthIndex = totalEmployees > 0 ? Math.round((presentToday / totalEmployees) * 100) : 0;

  // 2. AI ACTION CENTER
  const anomalies = await prisma.anomalyFlag.findMany({
    where: { resolvedBool: false },
    include: { employee: { include: { user: true } } },
    orderBy: { detectedAt: 'desc' },
    take: 3
  });

  const pendingLeaves = await prisma.leaveRequest.findMany({
    where: { status: "PENDING" },
    include: { employee: { include: { user: true } } },
    orderBy: { startDate: 'asc' },
    take: 3
  });

  const actionItems = [
    ...anomalies.map(a => ({
      id: `anom-${a.id}`,
      type: 'ANOMALY',
      title: 'Attendance Anomaly',
      desc: `${a.employee.user.name} • ${a.deviation || 'Irregularity'}`,
      time: new Date(a.detectedAt),
      link: `/people/${a.employeeId}`,
      iconClass: styles.aiIconAnomaly
    })),
    ...pendingLeaves.map(l => ({
      id: `leave-${l.id}`,
      type: 'LEAVE',
      title: 'Leave Approval',
      desc: `${l.employee.user.name} • ${l.type}`,
      time: new Date(l.createdAt),
      link: '/leave',
      iconClass: styles.aiIconLeave
    }))
  ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 5);

  // 3. RECENT ACTIVITIES
  const recentAttendances = await prisma.attendance.findMany({
    where: { checkIn: { not: null } },
    include: { employee: { include: { user: true } } },
    orderBy: { checkIn: 'desc' },
    take: 5
  });

  const activities = recentAttendances.map(a => ({
    id: a.id,
    time: a.checkIn!,
    name: a.employee.user.name,
    code: a.employee.employeeCode,
    action: "checked in",
    dept: a.employee.department,
    dotClass: styles.actDotPresent
  }));

  // 4. DEPARTMENT OVERVIEW
  const depts = await prisma.employee.groupBy({
    by: ['department'],
    _count: { id: true },
  });

  const deptStats = depts.map(d => ({
    name: d.department,
    count: d._count.id,
    health: Math.floor(Math.random() * 15) + 85, // Mocked health per department 85-100%
    change: `+${Math.floor(Math.random() * 5)}%`,
    color: d.department === 'Engineering' ? '#4DA3FF' : d.department === 'Design' ? '#B070FF' : d.department === 'Product' ? '#00FF9D' : d.department === 'Marketing' ? '#FFAA00' : '#E34F26'
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // 5. UPCOMING LEAVES
  const upcomingLeaves = await prisma.leaveRequest.findMany({
    where: { status: "APPROVED", startDate: { gte: today } },
    include: { employee: { include: { user: true } } },
    orderBy: { startDate: 'asc' },
    take: 4
  });

  // SVG SPARKLINE GENERATOR (mock data for visual)
  const renderSparkline = (color: string) => {
    const pts = Array.from({length: 10}, (_, i) => `${i * 8},${30 - (Math.random() * 20 + 5)}`).join(" ");
    return (
      <svg className={styles.sparkline} viewBox="0 0 80 30">
        <polyline points={pts} stroke={color} />
      </svg>
    );
  };

  const circumference = 2 * Math.PI * 72; // r=72
  const offset = circumference - (healthIndex / 100) * circumference;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.greeting}>Good afternoon, Admin 👋</h1>
          <p className={styles.subtitle}>Here's what's happening in your organization today.</p>
        </div>
        <LiveClock />
      </header>

      {/* TOP METRICS */}
      <div className={styles.topMetricsGrid}>
        <div className={`spatial-panel ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.metricIcon} ${styles.metricIconTotal}`}>👥</div>
            <span className={styles.metricLabel}>TOTAL EMPLOYEES</span>
          </div>
          <div className={styles.metricValue}>{totalEmployees}</div>
          <div className={`${styles.metricSub} ${styles.positive}`}>↑ 8 vs last month</div>
          {renderSparkline("var(--accent-primary)")}
        </div>

        <div className={`spatial-panel ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.metricIcon} ${styles.metricIconPresent}`}>✅</div>
            <span className={styles.metricLabel}>PRESENT TODAY</span>
          </div>
          <div className={styles.metricValue}>{presentToday}</div>
          <div className={styles.metricSub}>{healthIndex}%</div>
          {renderSparkline("#4DA3FF")}
        </div>

        <div className={`spatial-panel ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.metricIcon} ${styles.metricIconLate}`}>⏱</div>
            <span className={styles.metricLabel}>LATE ARRIVALS</span>
          </div>
          <div className={styles.metricValue}>{lateArrivals < 10 ? `0${lateArrivals}` : lateArrivals}</div>
          <div className={styles.metricSub}>5.5%</div>
          {renderSparkline("#FFAA00")}
        </div>

        <div className={`spatial-panel ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.metricIcon} ${styles.metricIconLeave}`}>🏖</div>
            <span className={styles.metricLabel}>ON LEAVE</span>
          </div>
          <div className={styles.metricValue}>{onLeave < 10 ? `0${onLeave}` : onLeave}</div>
          <div className={styles.metricSub}>2.3%</div>
          {renderSparkline("#B070FF")}
        </div>

        <div className={`spatial-panel ${styles.metricCard}`}>
          <div className={styles.metricHeader}>
            <div className={`${styles.metricIcon} ${styles.metricIconAbsent}`}>🚫</div>
            <span className={styles.metricLabel}>ABSENT</span>
          </div>
          <div className={styles.metricValue}>{absent < 10 ? `0${absent}` : absent}</div>
          <div className={styles.metricSub}>0.8%</div>
          {renderSparkline("var(--status-critical)")}
        </div>
      </div>

      {/* MID GRID */}
      <div className={styles.threeColGrid}>
        
        {/* ORGANIZATION HEALTH */}
        <div className={`spatial-panel-raised`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Organization Health</h2>
            <select className={styles.panelSelect}><option>This Week</option></select>
          </div>
          <div className={styles.healthLayout}>
            <div className={styles.donutWrapper}>
              <svg className={styles.donutSvg} viewBox="0 0 160 160">
                <circle className={styles.donutBg} cx="80" cy="80" r="72" />
                <circle 
                  className={styles.donutFill} 
                  cx="80" cy="80" r="72" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={offset} 
                />
              </svg>
              <div className={styles.donutCenter}>
                <div className={styles.donutPercent}>{healthIndex}%</div>
                <div className={styles.donutLabel}>HEALTH INDEX</div>
              </div>
            </div>
            <div className={styles.healthStats}>
              <div className={styles.healthStatItem}>
                <div className={styles.hsLeft}>
                  <div className={styles.hsIcon} style={{color: 'var(--status-success)'}}>G</div>
                  <span className={styles.hsLabel}>Attendance</span>
                </div>
                <div className={styles.hsValue}>96%</div>
                <div className={styles.hsChange}>↑ 4.2%</div>
              </div>
              <div className={styles.healthStatItem}>
                <div className={styles.hsLeft}>
                  <div className={styles.hsIcon} style={{color: '#4DA3FF'}}>E</div>
                  <span className={styles.hsLabel}>Engagement</span>
                </div>
                <div className={styles.hsValue}>91%</div>
                <div className={styles.hsChange}>↑ 2.1%</div>
              </div>
              <div className={styles.healthStatItem}>
                <div className={styles.hsLeft}>
                  <div className={styles.hsIcon} style={{color: '#FFAA00'}}>W</div>
                  <span className={styles.hsLabel}>Workload</span>
                </div>
                <div className={styles.hsValue}>88%</div>
                <div className={styles.hsChange}>↑ 1.8%</div>
              </div>
            </div>
          </div>
        </div>

        {/* ATTENDANCE TREND */}
        <div className={`spatial-panel-raised`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Attendance Trend</h2>
            <select className={styles.panelSelect}><option>This Week</option></select>
          </div>
          <div className={styles.chartContainer}>
            <svg className={styles.chartSvg} viewBox="0 0 400 160" preserveAspectRatio="none">
              <line x1="0" y1="40" x2="400" y2="40" className={styles.chartGrid} />
              <line x1="0" y1="80" x2="400" y2="80" className={styles.chartGrid} />
              <line x1="0" y1="120" x2="400" y2="120" className={styles.chartGrid} />
              <polyline points="0,60 50,80 100,50 150,90 200,40 250,70 300,30 350,50 400,20" className={styles.chartLine} />
              <circle cx="250" cy="70" r="4" className={styles.chartPoint} />
            </svg>
            <div className={styles.chartLabelsY}>
              <span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span>
            </div>
            <div className={styles.chartLabelsX}>
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>
        </div>

        {/* AI ACTION CENTER */}
        <div className={`spatial-panel-raised`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>AI Action Center</h2>
            <button className={styles.viewAllBtn}>View All ↗</button>
          </div>
          <div className={styles.actionList}>
            {actionItems.map(act => (
              <div key={act.id} className={`${styles.actionItem} ${act.type === 'ANOMALY' ? styles.actionAnomaly : styles.actionLeave}`}>
                <div className={`${styles.aiIcon} ${act.iconClass}`}>
                  {act.type === 'ANOMALY' ? '⚠' : '✉'}
                </div>
                <div className={styles.aiContent}>
                  <div className={styles.aiTitle}>{act.title}</div>
                  <div className={styles.aiDesc}>{act.desc}</div>
                </div>
                <div className={styles.aiTime}>
                  {act.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
                <Link href={act.link}>
                  <button className={styles.btnReview}>Review</button>
                </Link>
              </div>
            ))}
            {actionItems.length === 0 && <div className={styles.aiDesc}>No pending actions.</div>}
          </div>
        </div>

      </div>

      {/* BOTTOM GRID */}
      <div className={styles.threeColGrid}>
        
        {/* RECENT ACTIVITIES */}
        <div className={`spatial-panel`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Recent Activities</h2>
            <button className={styles.viewAllBtn}>View All ↗</button>
          </div>
          <div className={styles.activityList}>
            {activities.map(act => (
              <div key={act.id} className={styles.actItem}>
                <div className={`${styles.actDot} ${act.dotClass}`}></div>
                <div className={styles.actTime}>
                  {act.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                </div>
                <div className={styles.actContent}>
                  <div className={styles.actUser}>
                    <div className={styles.actAvatar}>{act.name.substring(0,2).toUpperCase()}</div>
                    <span className={styles.actName}>{act.name}</span>
                    <span className={styles.actAction}>{act.action}</span>
                  </div>
                  <div className={styles.actDetail}>
                    • {act.code} • {act.dept}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEPARTMENT OVERVIEW */}
        <div className={`spatial-panel`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Department Overview</h2>
            <button className={styles.viewAllBtn}>View All ↗</button>
          </div>
          <div className={styles.deptList}>
            {deptStats.map(dept => (
              <div key={dept.name} className={styles.deptItem}>
                <div className={styles.deptIcon} style={{color: dept.color}}>
                  {dept.name[0]}
                </div>
                <div className={styles.deptInfo}>
                  <div className={styles.deptName}>{dept.name}</div>
                  <div className={styles.deptCount}>{dept.count} Employees</div>
                </div>
                <div className={styles.deptProgressWrapper}>
                  <div className={styles.deptProgressBg}>
                    <div className={styles.deptProgressFill} style={{width: `${dept.health}%`, background: dept.color}}></div>
                  </div>
                </div>
                <div className={styles.deptStats}>
                  <span className={styles.deptPercent}>{dept.health}%</span>
                  <span className={styles.deptChange}>{dept.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* UPCOMING LEAVES */}
        <div className={`spatial-panel`}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>Upcoming Leaves</h2>
            <button className={styles.viewAllBtn}>View Calendar ↗</button>
          </div>
          <div className={styles.leaveList}>
            {upcomingLeaves.length === 0 ? <div className={styles.subtitle}>No upcoming leaves.</div> : upcomingLeaves.map(leave => {
              const d = leave.startDate;
              const duration = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24)) + 1;
              return (
                <div key={leave.id} className={styles.leaveItem}>
                  <div className={styles.leaveDateBox}>
                    <div className={styles.leaveDay}>{d.getDate()}</div>
                    <div className={styles.leaveMonth}>{d.toLocaleString('en-US', {month:'short'})}</div>
                  </div>
                  <div className={styles.leaveUser}>
                    <div className={styles.leaveName}>{leave.employee.user.name}</div>
                    <div className={styles.leaveType}>{leave.type} • {duration} Day{duration > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
