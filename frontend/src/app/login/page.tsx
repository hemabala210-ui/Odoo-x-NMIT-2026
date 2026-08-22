"use client";

import { useState } from "next/form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app we'd authenticate here.
    // The requirement is to land on the people page after login.
    router.push("/people");
  };

  return (
    <div className={styles.container}>
      <div className={`neo-panel ${styles.authCard}`}>
        <div className={styles.logo}>
          <span className={styles.brandMark}>◈</span>
          DAYFLOW
        </div>
        
        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Login ID / Email</label>
            <input 
              type="text" 
              className={styles.input} 
              required 
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input 
              type="password" 
              className={styles.input} 
              required 
            />
          </div>

          <button type="submit" className={styles.submitBtn}>
            Sign In
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>Don't have an account?</span>
          <Link href="/signup" className={styles.footerLink}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
