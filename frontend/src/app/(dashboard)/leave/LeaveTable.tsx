"use client";

import { useTransition } from "react";
import { approveLeave, rejectLeave } from "./actions";
import styles from "./page.module.css";

type LeaveData = {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  durationDays: number;
  status: string;
  remarks: string | null;
  employee: {
    user: { name: string };
  };
};

export default function LeaveTable({ leaves }: { leaves: LeaveData[] }) {
  const [isPending, startTransition] = useTransition();

  const handleApprove = (id: string) => {
    startTransition(() => {
      approveLeave(id);
    });
  };

  const handleReject = (id: string) => {
    startTransition(() => {
      rejectLeave(id);
    });
  };

  const pending = leaves.filter(l => l.status === "PENDING");
  const approved = leaves.filter(l => l.status === "APPROVED");
  const rejected = leaves.filter(l => l.status === "REJECTED");

  const renderCard = (leave: LeaveData, isPendingAction: boolean) => {
    const initials = leave.employee.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    const statusClass = leave.status === "PENDING" ? styles.pending : leave.status === "APPROVED" ? styles.approved : styles.rejected;

    return (
      <div key={leave.id} className={`spatial-panel ${styles.requestCard} ${statusClass}`}>
        <div className={styles.cardHeader}>
          <div className={styles.employeeInfo}>
            <div className={styles.avatar}>{initials}</div>
            <div className={styles.name}>{leave.employee.user.name}</div>
          </div>
        </div>
        
        <div className={styles.typeBadge}>{leave.type}</div>

        <div className={styles.dateBlock}>
          <div>
            <div className={styles.dateLabel}>START</div>
            <div className={styles.dateValue}>{new Date(leave.startDate).toLocaleDateString()}</div>
          </div>
          <div className={styles.duration}>{leave.durationDays}d</div>
          <div style={{textAlign: 'right'}}>
            <div className={styles.dateLabel}>END</div>
            <div className={styles.dateValue}>{new Date(leave.endDate).toLocaleDateString()}</div>
          </div>
        </div>

        {isPendingAction ? (
          <div className={styles.actions}>
            <button 
              className={`${styles.btnAction} ${styles.btnApprove}`} 
              onClick={() => handleApprove(leave.id)}
              disabled={isPending}
            >
              APPROVE
            </button>
            <button 
              className={`${styles.btnAction} ${styles.btnReject}`} 
              onClick={() => handleReject(leave.id)}
              disabled={isPending}
            >
              REJECT
            </button>
          </div>
        ) : (
          <div className={styles.resolvedState}>
            RESOLVED: {leave.status}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.pipelineGrid}>
      
      <div className={styles.pipelineColumn}>
        <div className={styles.colHeader}>
          <span className={styles.colTitle}>PENDING REVIEW</span>
          <span className={styles.colCount}>{pending.length}</span>
        </div>
        {pending.length === 0 && <div className={styles.emptyState}>No pending requests</div>}
        {pending.map(l => renderCard(l, true))}
      </div>

      <div className={styles.pipelineColumn}>
        <div className={styles.colHeader}>
          <span className={styles.colTitle}>APPROVED</span>
          <span className={styles.colCount}>{approved.length}</span>
        </div>
        {approved.length === 0 && <div className={styles.emptyState}>No approved requests</div>}
        {approved.map(l => renderCard(l, false))}
      </div>

      <div className={styles.pipelineColumn}>
        <div className={styles.colHeader}>
          <span className={styles.colTitle}>REJECTED</span>
          <span className={styles.colCount}>{rejected.length}</span>
        </div>
        {rejected.length === 0 && <div className={styles.emptyState}>No rejected requests</div>}
        {rejected.map(l => renderCard(l, false))}
      </div>

    </div>
  );
}
