import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import { notFound } from "next/navigation";
import Link from "next/link";

interface TimelineEvent {
  id: string;
  date: Date;
  type: "ATTENDANCE" | "LEAVE" | "PAYROLL" | "JOIN";
  title: string;
  description: string;
  status?: string;
  markerClass: string;
}

export default async function EmployeeDossier({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      user: true,
      attendances: { orderBy: { date: "desc" }, take: 14 },
      leaveRequests: { orderBy: { startDate: "desc" } },
      payrolls: { include: { history: true }, orderBy: { effectiveDate: "desc" } },
    },
  });

  if (!employee) return notFound();

  // Aggregate events for the activity timeline
  const events: TimelineEvent[] = [];

  events.push({
    id: "join",
    date: employee.joinDate,
    type: "JOIN",
    title: `Joined Organization`,
    description: `Assigned to ${employee.department} / ${employee.team}`,
    markerClass: styles.eventMarker,
  });

  employee.attendances.forEach((att) => {
    events.push({
      id: att.id,
      date: att.date,
      type: "ATTENDANCE",
      title: `Attendance: ${att.status}`,
      description: att.checkIn ? `Checked in at ${att.checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "No check-in recorded",
      status: att.status,
      markerClass: `${styles.eventMarker} ${styles.markerAttendance}`,
    });
  });

  employee.leaveRequests.forEach((leave) => {
    events.push({
      id: leave.id,
      date: leave.startDate,
      type: "LEAVE",
      title: `Leave request: ${leave.status}`,
      description: `"${leave.remarks || leave.type}"`,
      status: leave.status,
      markerClass: `${styles.eventMarker} ${styles.markerLeave}`,
    });
  });

  employee.payrolls.forEach((payroll) => {
    events.push({
      id: payroll.id,
      date: payroll.effectiveDate,
      type: "PAYROLL",
      title: `Payroll Generated`,
      description: `Net Payable: ₹${payroll.net.toLocaleString('en-IN')}`,
      markerClass: `${styles.eventMarker} ${styles.markerPayroll}`,
    });
  });

  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  const formatDateLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - eventDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "YEST";
    return eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  };

  const initials = employee.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/people" className={styles.backBtn}>← DIRECTORY</Link>
      </header>

      <div className={styles.dossierGrid}>
        
        {/* IDENTITY COLUMN */}
        <div className={styles.identityCol}>
          <div className={`spatial-panel ${styles.identityCard}`}>
            <div className={styles.avatar}>{initials}</div>
            <h1 className={styles.name}>{employee.user.name}</h1>
            <div className={styles.role}>{employee.designation}</div>
            
            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>ID</span>
                <span className={styles.metaValue}>{employee.employeeCode}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>DEPARTMENT</span>
                <span className={styles.metaValue}>{employee.department}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>TEAM</span>
                <span className={styles.metaValue}>{employee.team}</span>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>JOIN DATE</span>
                <span className={styles.metaValue}>{new Date(employee.joinDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className={styles.actions}>
              <Link href={`/payroll?employeeId=${employee.id}`} className={styles.quickAction}>PAYROLL</Link>
              <Link href={`/attendance?employeeId=${employee.id}`} className={styles.quickAction}>ATTENDANCE</Link>
            </div>
          </div>

          <div className={`spatial-panel ${styles.metricCard}`}>
            <div>
              <div className={styles.metaLabel} style={{marginBottom: 4}}>LEAVE BALANCE</div>
              <div className={styles.metaValue}>ANNUAL ALLOWANCE</div>
            </div>
            <div className={styles.metricValue}>12</div>
          </div>
        </div>

        {/* TIMELINE COLUMN */}
        <div className={styles.timelineCol}>
          <div className={`spatial-panel-raised ${styles.timelineCard}`}>
            <h2 className={styles.sectionTitle}>ACTIVITY TIMELINE</h2>
            
            <div className={styles.horizontalTimeline}>
              {events.map((event) => (
                <div key={event.id} className={styles.timelineEvent}>
                  <div className={styles.dateCol}>
                    {formatDateLabel(event.date)}<br/>
                    <span style={{color: 'var(--text-tertiary)'}}>
                      {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                  </div>
                  
                  <div className={event.markerClass}></div>
                  
                  <div className={styles.eventContent}>
                    <div className={styles.eventHeader}>
                      <span className={styles.eventTitle}>{event.title}</span>
                      <span className={styles.eventType}>{event.type}</span>
                    </div>
                    <div className={styles.eventDesc}>{event.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
