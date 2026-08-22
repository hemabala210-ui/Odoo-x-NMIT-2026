import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import styles from "./page.module.css";
import Link from "next/link";

export default async function PayrollTransparency({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = await params;
  
  const payroll = await prisma.payroll.findUnique({
    where: { employeeId },
    include: {
      employee: { include: { user: true } },
      history: { orderBy: { changedAt: "desc" } }
    },
  });

  if (!payroll) return notFound();

  const totalEarnings = payroll.baseSalary + payroll.bonus;
  const netPay = totalEarnings - payroll.deductions;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.pageTitle}>PAYROLL TRANSPARENCY</h1>
          <span className={styles.badge}>{payroll.employee.user.name}</span>
        </div>
        <p className={styles.subtitle}>
          Explainable compensation breakdown and historical deltas.
        </p>
      </header>

      <div className={styles.grid}>
        {/* Breakdown Panel */}
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>CURRENT STRUCTURE</h2>
          
          <div className={styles.breakdownList}>
            <div className={styles.breakdownRow}>
              <span className={styles.label}>Base Salary</span>
              <span className={styles.value}>₹{payroll.baseSalary.toLocaleString()}</span>
            </div>
            <div className={styles.breakdownRow}>
              <span className={styles.label}>Performance Bonus</span>
              <span className={styles.value}>+₹{payroll.bonus.toLocaleString()}</span>
            </div>
            <div className={`${styles.breakdownRow} ${styles.deduction}`}>
              <span className={styles.label}>Tax & Deductions</span>
              <span className={styles.value}>-₹{payroll.deductions.toLocaleString()}</span>
            </div>
            
            <div className={styles.divider} />
            
            <div className={styles.breakdownRowTotal}>
              <span className={styles.label}>Net Pay</span>
              <span className={styles.valueTotal}>₹{netPay.toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Change History Panel */}
        <section className={styles.panel}>
          <h2 className={styles.sectionTitle}>CHANGE HISTORY (WHY?)</h2>
          
          <div className={styles.historyList}>
            {payroll.history.length === 0 ? (
              <p className={styles.empty}>No changes recorded yet.</p>
            ) : (
              payroll.history.map(hist => {
                const diff = hist.newValue - hist.oldValue;
                const isPositive = diff > 0;
                
                return (
                  <div key={hist.id} className={styles.historyCard}>
                    <div className={styles.histHeader}>
                      <span className={styles.histDate}>
                        {new Date(hist.changedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                      <span className={styles.histField}>{hist.fieldChanged.toUpperCase()}</span>
                    </div>
                    
                    <div className={styles.histDelta}>
                      <span className={styles.oldValue}>₹{hist.oldValue.toLocaleString()}</span>
                      <span className={styles.arrow}>→</span>
                      <span className={styles.newValue}>₹{hist.newValue.toLocaleString()}</span>
                      <span className={`${styles.diff} ${isPositive ? styles.diffPos : styles.diffNeg}`}>
                        ({isPositive ? '+' : ''}₹{Math.abs(diff).toLocaleString()})
                      </span>
                    </div>
                    
                    {hist.reason && (
                      <div className={styles.histReason}>
                        <span className={styles.reasonLabel}>Context:</span> {hist.reason}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
