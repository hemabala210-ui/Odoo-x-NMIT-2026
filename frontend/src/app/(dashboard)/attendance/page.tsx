import prisma from "@/lib/prisma";
import styles from "./page.module.css";
import Link from "next/link";
import SearchBar from "@/components/SearchBar/SearchBar";
import React from "react";

export default async function AttendanceList({ searchParams }: { searchParams: Promise<{ q?: string, view?: string }> }) {
  const params = await searchParams;
  const query = params?.q || "";
  const view = params?.view || "daily"; // daily | heatmap

  // Base employee fetch for both views
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
        // Fetch last 14 days for heatmap, or just today for daily
        where: { 
          date: { 
            gte: new Date(new Date().setDate(new Date().getDate() - 14)) 
          } 
        },
        orderBy: { date: 'asc' }
      }
    },
    orderBy: { user: { name: "asc" } },
    take: 50,
  });

  // Helper for Daily View (filter to just today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Helper for Heatmap View (generate last 14 days array)
  const last14Days = Array.from({length: 14}).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    d.setHours(0, 0, 0, 0);
    return d;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.pageTitle}>ATTENDANCE RECORDS</h1>
            <p className={styles.subtitle}>Daily logs and spatial heatmaps.</p>
          </div>
        </div>
        
        <div className={styles.controlsRow}>
          <SearchBar placeholder="Search directory..." />
          
          <div className={styles.viewToggles}>
            <Link href="?view=daily" className={`${styles.viewBtn} ${view === 'daily' ? styles.viewBtnActive : ''}`}>
              DAILY
            </Link>
            <Link href="?view=heatmap" className={`${styles.viewBtn} ${view === 'heatmap' ? styles.viewBtnActive : ''}`}>
              HEATMAP
            </Link>
          </div>
        </div>
      </header>

      <div className={`spatial-panel ${styles.tableContainer}`}>
        
        {view === 'daily' && (
          <>
            <div className={styles.tableHeaderSection}>
              <span className={styles.currentDateLabel}>
                {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const todayRecord = emp.attendances.find(a => {
                    const d = new Date(a.date);
                    d.setHours(0,0,0,0);
                    return d.getTime() === today.getTime();
                  });

                  const checkInStr = todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--";
                  const checkOutStr = todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "--:--";
                  
                  let workHours = "--:--";
                  if (todayRecord?.checkIn && todayRecord?.checkOut) {
                    const diffMs = new Date(todayRecord.checkOut).getTime() - new Date(todayRecord.checkIn).getTime();
                    const diffHrs = diffMs / (1000 * 60 * 60);
                    const hrs = Math.floor(diffHrs);
                    const mins = Math.round((diffHrs - hrs) * 60);
                    workHours = `${hrs.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m`;
                  }

                  const initials = emp.user.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
                  const status = todayRecord?.status || 'ABSENT';

                  return (
                    <tr key={emp.id}>
                      <td className={styles.nameCol}>
                        <div className={styles.avatar}>{initials}</div>
                        <span>{emp.user.name}</span>
                      </td>
                      <td className={styles.monoTime}>{checkInStr}</td>
                      <td className={styles.monoTime}>{checkOutStr}</td>
                      <td className={styles.monoTime}>{workHours}</td>
                      <td>
                        <div className="signal-badge">
                           {status === 'PRESENT' && <span className="signal-dot signal-success"></span>}
                           {status === 'LEAVE' && <span className="signal-dot signal-warning"></span>}
                           {status === 'ABSENT' && <span className="signal-dot signal-critical"></span>}
                           <span className={styles.monoTime} style={{marginLeft: 8}}>{status}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                
                {employees.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>No attendance records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {view === 'heatmap' && (
          <div className={styles.heatmapGrid}>
            <div className={styles.heatmapHeader}>EMPLOYEE</div>
            {last14Days.map(d => (
              <div key={d.toISOString()} className={styles.heatmapHeader}>
                {d.getDate()}
              </div>
            ))}

            {employees.map(emp => (
              <React.Fragment key={emp.id}>
                <div className={styles.heatmapRowLabel}>{emp.user.name}</div>
                {last14Days.map(day => {
                  const record = emp.attendances.find(a => {
                    const d = new Date(a.date);
                    d.setHours(0,0,0,0);
                    return d.getTime() === day.getTime();
                  });

                  let cellClass = "";
                  if (record?.status === 'PRESENT') cellClass = styles.present;
                  else if (record?.status === 'LEAVE') cellClass = styles.leave;
                  else if (day.getDay() !== 0 && day.getDay() !== 6) cellClass = styles.missing; // weekday missing

                  return (
                    <div 
                      key={`${emp.id}-${day.toISOString()}`} 
                      className={`${styles.heatmapCell} ${cellClass}`}
                      title={`${emp.user.name} - ${day.toLocaleDateString()} - ${record?.status || (cellClass === styles.missing ? 'ABSENT' : 'WEEKEND')}`}
                    ></div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
