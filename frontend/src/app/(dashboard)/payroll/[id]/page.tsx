import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import styles from "./page.module.css";
import PrintButton from "./PrintButton";

export default async function PayslipPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const payroll = await prisma.payroll.findUnique({
    where: { id },
    include: {
      employee: {
        include: { user: true },
      },
    },
  });

  if (!payroll) {
    notFound();
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Earnings breakdown based on Gross (for display purposes)
  const basic = payroll.gross * 0.50;
  const hra = basic * 0.20;
  const standardAllowance = payroll.gross - basic - hra;

  const totalDeductions = payroll.taxDeduction + payroll.pfDeduction;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/payroll" className={styles.backButton}>← BACK TO PAYROLL</Link>
        <PrintButton />
      </header>

      <div className={`spatial-panel ${styles.payslipDocument}`}>
        <div className={styles.companyHeader}>
          <div className={styles.logo}>
            <span className={styles.brandMark}>◈</span>
            DAYFLOW
          </div>
          <div className={styles.payslipTitle}>
            <h2>PAYSLIP</h2>
            <p>For the month of {payroll.month}</p>
          </div>
        </div>

        <div className={styles.employeeDetails}>
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Employee Name</span>
            <span className={styles.detailValue}>{payroll.employee.user.name}</span>
          </div>
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Employee ID</span>
            <span className={styles.detailValue}>{payroll.employee.employeeCode}</span>
          </div>
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Designation</span>
            <span className={styles.detailValue}>{payroll.employee.designation}</span>
          </div>
          <div className={styles.detailGroup}>
            <span className={styles.detailLabel}>Department</span>
            <span className={styles.detailValue}>{payroll.employee.department}</span>
          </div>
        </div>

        <div className={styles.salaryTables}>
          <div className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>Earnings</h3>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>Basic Salary</td>
                  <td className={styles.amount}>{formatCurrency(basic)}</td>
                </tr>
                <tr>
                  <td>House Rent Allowance (HRA)</td>
                  <td className={styles.amount}>{formatCurrency(hra)}</td>
                </tr>
                <tr>
                  <td>Standard Allowance</td>
                  <td className={styles.amount}>{formatCurrency(standardAllowance)}</td>
                </tr>
                <tr className={styles.totalRow}>
                  <td>Total Earnings</td>
                  <td className={styles.amount}>{formatCurrency(payroll.gross)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className={styles.tableSection}>
            <h3 className={styles.sectionTitle}>Deductions</h3>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>Provident Fund (PF)</td>
                  <td className={styles.amount}>{formatCurrency(payroll.pfDeduction)}</td>
                </tr>
                <tr>
                  <td>Income Tax / TDS</td>
                  <td className={styles.amount}>{formatCurrency(payroll.taxDeduction)}</td>
                </tr>
                <tr>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
                <tr className={styles.totalRow}>
                  <td>Total Deductions</td>
                  <td className={styles.amount}>{formatCurrency(totalDeductions)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.netPaySection}>
          <div className={styles.netPayLabel}>NET PAYABLE AMOUNT</div>
          <div className={styles.netPayValue}>{formatCurrency(payroll.net)}</div>
        </div>

        <div className={styles.footer}>
          <p>SYSTEM GENERATED DOCUMENT - NO SIGNATURE REQUIRED</p>
        </div>
      </div>
    </div>
  );
}
