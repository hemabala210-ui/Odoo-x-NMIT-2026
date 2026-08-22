"use client";

import styles from "./page.module.css";

export default function PrintButton() {
  return (
    <button className={styles.btnPrint} onClick={() => window.print()}>
      PRINT PAYSLIP
    </button>
  );
}
