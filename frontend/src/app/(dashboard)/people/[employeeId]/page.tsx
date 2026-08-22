import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import { notFound } from "next/navigation";

interface TimelineEvent {
  id: string;
  date: Date;
  type: "ATTENDANCE" | "LEAVE" | "PAYROLL" | "DOCUMENT" | "JOIN";
  title: string;
  description: string;
  status?: string;
}

export default async function Employee360({
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
      payrolls: { include: { history: true } },
    },
  });

  if (!employee) return notFound();

  // Aggregate events
  const events: TimelineEvent[] = [];

  // Join Event
  events.push({
    id: "join",
    date: employee.joinDate,
    type: "JOIN",
    title: `Joined ${employee.team} Team`,
    description: "Welcome to Dayflow",
  });

  // Attendance Events
  employee.attendances.forEach((att) => {
    events.push({
      id: att.id,
      date: att.date,
      type: "ATTENDANCE",
      title: `Attendance: ${att.status}`,
      description: att.checkIn ? `Checked in at ${att.checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "No check-in recorded",
      status: att.status,
    });
  });

  // Leave Events
  employee.leaveRequests.forEach((leave) => {
    events.push({
      id: leave.id,
      date: leave.startDate,
      type: "LEAVE",
      title: `Leave request submitted`,
      description: `"${leave.remarks || leave.type}"`,
      status: leave.status,
    });
  });

  // Payroll Events
  employee.payrolls.forEach((payroll) => {
    payroll.history.forEach((hist) => {
      events.push({
        id: hist.id,
        date: hist.changedAt,
        type: "PAYROLL",
        title: `Salary structure updated`,
        description: `${hist.fieldChanged} changed: ₹${hist.oldValue} → ₹${hist.newValue}`,
      });
    });
  });

  // Sort by date descending
  events.sort((a, b) => b.date.getTime() - a.date.getTime());

  // Helper to format date relative to today
  const formatDateLabel = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - eventDate.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays === 0) return "TODAY";
    if (diffDays === 1) return "YESTERDAY";
    return eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
  };

  return (
    <div className={styles.container}>
      {/* Identity Card */}
      <div className={styles.identityCard}>
        <div className={styles.idHeader}>
          <div className={styles.avatar}>
            {employee.user.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.name}>{employee.user.name.toUpperCase()}</h1>
            <p className={styles.role}>{employee.designation}</p>
          </div>
          <div className={styles.empCode}>{employee.employeeCode}</div>
        </div>
        
        <div className={styles.idFooter}>
          <div className={styles.dept}>{employee.department.toUpperCase()} / {employee.team.toUpperCase()}</div>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>ATTENDANCE</span>
            <span className={styles.metricValue}>96%</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>LEAVE</span>
            <span className={styles.metricValue}>12d</span>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>PERFORMANCE</span>
            <span className={styles.metricValue}>91%</span>
          </div>
        </div>
      </div>

      {/* 360 Timeline */}
      <div className={styles.timelineContainer}>
        <h2 className={styles.timelineTitle}>ACTIVITY TIMELINE</h2>
        
        <div className={styles.timeline}>
          {events.map((event) => (
            <div key={event.id} className={styles.timelineEvent}>
              <div className={styles.dateLabel}>{formatDateLabel(event.date)}</div>
              
              <div className={styles.eventContent}>
                <div className={styles.eventIcon}>
                  {event.type === "ATTENDANCE" && (event.status === "PRESENT" ? "🟢" : "🟡")}
                  {event.type === "LEAVE" && "🏖"}
                  {event.type === "PAYROLL" && "💰"}
                  {event.type === "DOCUMENT" && "📄"}
                  {event.type === "JOIN" && "🚀"}
                </div>
                <div className={styles.eventDetails}>
                  <div className={styles.eventTitle}>{event.title}</div>
                  <div className={styles.eventDesc}>{event.description}</div>
                  {event.type === "LEAVE" && (
                    <div className={styles.eventStatus}>→ {event.status}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
