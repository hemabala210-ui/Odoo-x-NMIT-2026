"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "next/form";
import styles from "./TopNav.module.css";
import React from "react"; // Added to fix useState

export default function TopNav() {
  const pathname = usePathname();
  const [avatarMenuOpen, setAvatarMenuOpen] = React.useState(false);
  const [checkedIn, setCheckedIn] = React.useState(false);

  const navItems = [
    { label: "Employees", path: "/people" },
    { label: "Attendance", path: "/attendance" },
    { label: "Time Off", path: "/leave" },
    { label: "Command Center", path: "/command-center" },
    { label: "Payroll", path: "/payroll" },
    { label: "Settings", path: "/settings" }
  ];

  return (
    <nav className={styles.topNav}>
      <div className={styles.leftSection}>
        <div className={styles.logo}>
          <span className={styles.brandMark}>◈</span>
          DAYFLOW
        </div>
        
        <div className={styles.navLinks}>
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`${styles.navItem} ${pathname.startsWith(item.path) ? styles.active : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.rightSection}>
        <div className={styles.cmdHint}>
          <span className={styles.cmdKey}>⌘</span>K
        </div>
        
        <div 
          className={styles.avatarWrapper} 
          onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
        >
          <div className={styles.avatar}>A</div>
          <div className={`${styles.statusDot} ${checkedIn ? styles.online : styles.offline}`}></div>
        </div>

        {avatarMenuOpen && (
          <div className={`spatial-panel-raised ${styles.avatarDropdown}`}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownName}>Akash</div>
              <div className={styles.dropdownRole}>Administrator</div>
            </div>
            
            <div className={styles.dropdownDivider}></div>
            
            <Link href="/people/my-profile" className={styles.dropdownItem}>
              My Profile
            </Link>
            
            <button 
              className={styles.dropdownItem}
              onClick={() => setCheckedIn(!checkedIn)}
            >
              {checkedIn ? "Check Out ↘" : "Check IN ↗"}
            </button>
            
            <div className={styles.dropdownDivider}></div>
            
            <Link href="/login" className={styles.dropdownItemDanger}>
              Log Out
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
