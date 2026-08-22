import prisma from "@/lib/prisma";
import Link from "next/link";
import styles from "./page.module.css";
import SearchBar from "@/components/SearchBar/SearchBar";

export default async function PeopleDirectory({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params?.q || "";

  const employees = await prisma.employee.findMany({
    where: {
      user: {
        name: {
          contains: query,
          mode: "insensitive"
        }
      }
    },
    include: {
      user: true,
      attendances: {
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      },
      leaveRequests: {
        where: { status: "APPROVED", startDate: { lte: new Date() }, endDate: { gte: new Date() } }
      },
      anomalyFlags: {
        where: { resolvedBool: false },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>PEOPLE</h1>
          <p className={styles.subtitle}>Identity directory and operational states</p>
        </div>
        <div className={styles.controls}>
          <SearchBar placeholder="Search directory..." />
        </div>
      </header>

      <div className={styles.grid}>
        {employees.map((emp) => {
          const hasAnomaly = emp.anomalyFlags.length > 0;
          const isWorking = emp.attendances.length > 0 && emp.attendances[0].status === "PRESENT";
          const onLeave = emp.leaveRequests.length > 0;
          
          let stateLabel = "OFFLINE";
          let signalClass = "signal-offline";
          
          if (hasAnomaly) {
            stateLabel = "ATTENTION";
            signalClass = "signal-critical";
          } else if (onLeave) {
            stateLabel = "ON LEAVE";
            signalClass = "signal-warning";
          } else if (isWorking) {
            stateLabel = "PRESENT";
            signalClass = "signal-success";
          }

          const initials = emp.user.name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

          return (
            <div key={emp.id} className={`spatial-panel ${styles.employeeUnit}`}>
              <div className={styles.unitHeader}>
                <div className={styles.avatar}>{initials}</div>
                <div className={styles.signals}>
                  <div className={styles.signalBadge}>
                    <span className={`signal-dot ${signalClass}`}></span>
                    {stateLabel}
                  </div>
                </div>
              </div>
              
              <div className={styles.unitBody}>
                <div className={styles.empName}>{emp.user.name}</div>
                <div className={styles.empRole}>{emp.designation}</div>
                
                <div className={styles.metaGrid}>
                  <div className={styles.metaLabel}>ID</div>
                  <div className={styles.metaValue}>{emp.employeeCode}</div>
                  <div className={styles.metaLabel}>DEPT</div>
                  <div className={styles.metaValue}>{emp.department}</div>
                </div>
              </div>

              <div className={styles.unitFooter}>
                <span className={styles.activityMeta}>
                  LAST ACTIVE: {isWorking && emp.attendances[0].checkIn ? new Date(emp.attendances[0].checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </span>
                <Link href={`/people/${emp.id}`} className={styles.actionBtn}>
                  OPEN DOSSIER ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
