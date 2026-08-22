import prisma from "@/lib/prisma";
import Link from "next/link";
import styles from "./page.module.css";
import SearchBar from "@/components/SearchBar/SearchBar";

export default async function PayrollManagement({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const query = params?.q || "";

  const payrolls = await prisma.payroll.findMany({
    where: {
      employee: {
        user: {
          name: {
            contains: query,
            mode: "insensitive"
          }
        }
      }
    },
    include: {
      employee: {
        include: {
          user: true,
        },
      },
    },
    orderBy: { effectiveDate: "desc" },
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>PAYROLL RUN</h1>
          <p className={styles.subtitle}>Compensation, deductions, and spatial payslips.</p>
        </div>
        <div className={styles.controls}>
          <SearchBar placeholder="Search by name..." />
        </div>
      </header>

      <div className={styles.payrollGrid}>
        {payrolls.map((payroll) => (
          <div key={payroll.id} className={`spatial-panel ${styles.payrollCard}`}>
            <div className={styles.cardHeader}>
              <div className={styles.empInfo}>
                <div className={styles.name}>{payroll.employee.user.name}</div>
                <div className={styles.role}>{payroll.employee.designation}</div>
              </div>
              <div className={styles.monthBadge}>{payroll.month}</div>
            </div>

            <div className={styles.salaryBlock}>
              <div className={styles.netAmount}>{formatCurrency(payroll.net)}</div>
              <div className={styles.netLabel}>NET PAYABLE</div>
            </div>

            <div className={styles.breakdown}>
              <div className={styles.breakdownItem}>
                <span className={styles.bdLabel}>GROSS</span>
                <span className={styles.bdValue}>{formatCurrency(payroll.gross)}</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.bdLabel}>TAX</span>
                <span className={styles.bdValue}>{formatCurrency(payroll.taxDeduction)}</span>
              </div>
              <div className={styles.breakdownItem}>
                <span className={styles.bdLabel}>PF</span>
                <span className={styles.bdValue}>{formatCurrency(payroll.pfDeduction)}</span>
              </div>
            </div>

            <Link href={`/payroll/${payroll.id}`} className={styles.btnPayslip}>OPEN PAYSLIP ↗</Link>
          </div>
        ))}

        {payrolls.length === 0 && (
          <p style={{color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)'}}>No payroll records found.</p>
        )}
      </div>
    </div>
  );
}
