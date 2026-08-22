import prisma from "@/lib/prisma";
import Link from "next/link";
import styles from "./page.module.css";

export default async function PeopleDirectory() {
  const employees = await prisma.employee.findMany({
    include: {
      user: true,
      attendances: {
        where: { date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      },
      anomalyFlags: {
        where: { resolvedBool: false },
      },
    },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.pageTitle}>PEOPLE</h1>
        <p className={styles.subtitle}>Directory and flow states</p>
      </header>

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.colAvatar}>AVATAR</div>
          <div className={styles.colEmployee}>EMPLOYEE</div>
          <div className={styles.colFlow}>FLOW</div>
          <div className={styles.colAction}>ACTION</div>
        </div>

        <div className={styles.tableBody}>
          {employees.map((emp) => {
            const hasAnomaly = emp.anomalyFlags.length > 0;
            const isWorking = emp.attendances.length > 0 && emp.attendances[0].status === "PRESENT";
            const isLeave = emp.attendances.length > 0 && emp.attendances[0].status === "LEAVE";
            
            let flowState = "● Inactive";
            let flowClass = styles.inactive;
            
            if (hasAnomaly) {
              flowState = "◐ Attention";
              flowClass = styles.attention;
            } else if (isWorking) {
              flowState = "● Active";
              flowClass = styles.active;
            } else if (isLeave) {
              flowState = "○ Leave";
              flowClass = styles.leave;
            }

            const initials = emp.user.name.split(" ").map((n) => n[0]).join("").substring(0, 2);

            return (
              <div key={emp.id} className={styles.tableRow}>
                <div className={styles.colAvatar}>
                  <div className={styles.avatar}>{initials}</div>
                </div>
                <div className={styles.colEmployee}>
                  <div className={styles.empName}>{emp.user.name}</div>
                  <div className={styles.empRole}>{emp.designation}</div>
                  <div className={styles.empId}>{emp.employeeCode}</div>
                </div>
                <div className={`${styles.colFlow} ${flowClass}`}>
                  {flowState}
                </div>
                <div className={styles.colAction}>
                  <Link href={`/people/${emp.id}`} className={styles.actionBtn}>
                    →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
