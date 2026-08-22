"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

export default function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => setTime(new Date()), 60000); // update every min
    return () => clearInterval(interval);
  }, []);

  if (!time) return null;

  return (
    <div className={styles.dateTimeDisplay}>
      <div className={styles.dateText}>
        {time.toLocaleDateString("en-US", { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' })}
      </div>
      <div className={styles.timeText}>
        {time.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })}
      </div>
    </div>
  );
}
