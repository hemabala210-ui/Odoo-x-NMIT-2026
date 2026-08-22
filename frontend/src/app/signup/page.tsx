"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function SignupPage() {
  const router = useRouter();
  
  const [company, setCompany] = useState("");
  const [fullName, setFullName] = useState("");
  const [generatedId, setGeneratedId] = useState("");

  const generateLogicId = (comp: string, name: string) => {
    if (!comp || !name) return "";
    
    // First two letters of company
    const compPart = comp.replace(/[^a-zA-Z]/g, "").substring(0, 2).toUpperCase();
    
    // First two letters of first name and last name
    const nameParts = name.trim().split(/\s+/);
    let namePart = "";
    if (nameParts.length >= 2) {
      namePart = nameParts[0].substring(0, 2).toUpperCase() + nameParts[nameParts.length - 1].substring(0, 2).toUpperCase();
    } else {
      namePart = name.replace(/[^a-zA-Z]/g, "").substring(0, 4).toUpperCase();
    }

    const year = new Date().getFullYear();
    const serial = "001"; // Mock serial

    return `${compPart}${namePart}${year}${serial}`;
  };

  const handleBlur = () => {
    setGeneratedId(generateLogicId(company, fullName));
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/people");
  };

  return (
    <div className={styles.container}>
      <div className={`neo-panel ${styles.authCard}`}>
        <div className={styles.logo}>
          <span className={styles.brandMark}>◈</span>
          DAYFLOW
        </div>
        
        <form onSubmit={handleSignup} className={styles.form}>
          
          <div className={styles.uploadGroup}>
             <div className={styles.uploadBtn}>↑</div>
             <span className={styles.uploadText}>Upload Logo</span>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Company Name</label>
            <input 
              type="text" 
              className={styles.input} 
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              onBlur={handleBlur}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Full Name</label>
            <input 
              type="text" 
              className={styles.input} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleBlur}
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email</label>
            <input 
              type="email" 
              className={styles.input} 
              required 
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Phone</label>
            <input 
              type="tel" 
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

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirm Password</label>
            <input 
              type="password" 
              className={styles.input} 
              required 
            />
          </div>

          {generatedId && (
            <div className={styles.generatedIdBox}>
              <span className={styles.idLabel}>Your System Logic ID:</span>
              <span className={styles.idValue}>{generatedId}</span>
              <p className={styles.idHint}>This ID will be used for your login and system records.</p>
            </div>
          )}

          <button type="submit" className={styles.submitBtn}>
            Sign Up
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.footerText}>Already have an account?</span>
          <Link href="/login" className={styles.footerLink}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
