import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default async function LeaveImpactSimulator({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      employee: { include: { user: true } },
    },
  });

  if (!leave) return notFound();

  // Find team members
  const teamMembers = await prisma.employee.findMany({
    where: { team: leave.employee.team },
  });

  // Find approved leaves during this period for the team
  const overlappingLeaves = await prisma.leaveRequest.findMany({
    where: {
      employeeId: { in: teamMembers.map(m => m.id) },
      status: "APPROVED",
      OR: [
        { startDate: { lte: leave.endDate }, endDate: { gte: leave.startDate } },
      ],
    },
    include: { employee: { include: { user: true } } },
  });

  const totalTeam = teamMembers.length;
  // Exclude the applicant themselves from the count if they were already approved (though this request is pending)
  const currentlyUnavailable = overlappingLeaves.length;
  const projectedUnavailable = currentlyUnavailable + 1; // +1 for this request
  const projectedCapacity = totalTeam > 0 ? Math.round(((totalTeam - projectedUnavailable) / totalTeam) * 100) : 0;

  const durationDays = Math.round(
    (leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24)
  ) + 1;

  let recommendation = "Approve with standard workflow.";
  let recommendationClass = styles.recommendApprove;
  
  if (projectedCapacity < 50) {
    recommendation = "Reject due to critical low capacity.";
    recommendationClass = styles.recommendReject;
  } else if (projectedCapacity < 85) {
    recommendation = "Approve with workload reassignment.";
    recommendationClass = styles.recommendWarn;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.leaveHeader}>
          <h1 className={styles.employeeName}>{leave.employee.user.name.toUpperCase()}</h1>
          <span className={styles.badge}>Leave Request</span>
        </div>
        <p className={styles.dates}>
          {new Date(leave.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          {" → "}
          {new Date(leave.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
        <p className={styles.details}>
          {durationDays} working days • Type: {leave.type}
        </p>
      </header>

      <section className={styles.impactSimulator}>
        <h2 className={styles.sectionTitle}>TEAM IMPACT</h2>
        <div className={styles.teamCapacity}>
          <div className={styles.capacityHeader}>
            <span>{leave.employee.team} Team</span>
            <span className={styles.capacityNumber}>{projectedCapacity}% capacity</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${projectedCapacity}%`, background: projectedCapacity < 70 ? 'var(--color-coral)' : 'var(--color-mint)' }} 
            />
          </div>
        </div>

        <div className={styles.impactDetails}>
          <p className={styles.impactText}>
            {leave.employee.user.name.split(" ")[0]}'s absence would leave:
          </p>
          <div className={styles.rosterStat}>
            <span className={styles.rosterTeam}>{leave.employee.team}</span>
            <span className={styles.rosterCount}>{totalTeam - projectedUnavailable}/{totalTeam} available</span>
          </div>
          
          {overlappingLeaves.length > 0 && (
            <div className={styles.overlapAlert}>
              <span className={styles.warnIcon}>⚠</span>
              <span>Overlaps with approved leave for: {overlappingLeaves.map(l => l.employee.user.name).join(", ")}</span>
            </div>
          )}
        </div>

        <div className={styles.recommendationBox}>
          <p className={styles.suggestedLabel}>Suggested:</p>
          <p className={`${styles.recommendationText} ${recommendationClass}`}>{recommendation}</p>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnPrimary}>Approve</button>
          <button className={styles.btnDanger}>Reject</button>
          {projectedCapacity >= 50 && projectedCapacity < 85 && (
            <button className={styles.btnSecondary}>Approve + Reassign</button>
          )}
        </div>
      </section>
    </div>
  );
}
