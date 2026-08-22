"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./CommandPalette.module.css";

type Command = {
  id: string;
  name: string;
  shortcut?: string;
  action: () => void;
  section: "NAVIGATION" | "ACTIONS";
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette on CMD+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const navigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const commands: Command[] = [
    { id: "go-people", name: "Search Employees", action: () => navigate("/people"), section: "NAVIGATION" },
    { id: "go-attendance", name: "Go to Attendance", action: () => navigate("/attendance"), section: "NAVIGATION" },
    { id: "go-leave", name: "Review Pending Leave", action: () => navigate("/leave"), section: "NAVIGATION" },
    { id: "go-command", name: "Open Command Center", action: () => navigate("/command-center"), section: "NAVIGATION" },
    { id: "go-payroll", name: "Open Payroll", action: () => navigate("/payroll"), section: "NAVIGATION" },
    { id: "go-settings", name: "Open Settings", action: () => navigate("/settings"), section: "NAVIGATION" },
    { id: "action-leave", name: "Create Leave Request", action: () => navigate("/leave?action=create"), section: "ACTIONS" },
  ];

  const filteredCommands = query
    ? commands.filter((cmd) => cmd.name.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const navCommands = filteredCommands.filter((c) => c.section === "NAVIGATION");
  const actCommands = filteredCommands.filter((c) => c.section === "ACTIONS");

  return (
    <div className={styles.overlay} onClick={() => setIsOpen(false)}>
      <div 
        className={`spatial-panel ${styles.palette}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.inputWrapper}>
          <span className={styles.searchIcon}>⌘</span>
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.escHint}>ESC</span>
        </div>

        <div className={styles.results}>
          {navCommands.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>NAVIGATION</div>
              {navCommands.map((cmd) => (
                <button key={cmd.id} className={styles.commandItem} onClick={cmd.action}>
                  {cmd.name}
                </button>
              ))}
            </div>
          )}

          {actCommands.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>ACTIONS</div>
              {actCommands.map((cmd) => (
                <button key={cmd.id} className={styles.commandItem} onClick={cmd.action}>
                  {cmd.name}
                </button>
              ))}
            </div>
          )}
          
          {filteredCommands.length === 0 && (
            <div className={styles.emptyState}>
              No commands found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
