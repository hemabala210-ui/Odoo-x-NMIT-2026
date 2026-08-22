"use client";

import { useState } from "react";
import styles from "./page.module.css";

type Message = {
  id: string;
  role: "user" | "copilot";
  content: string | React.ReactNode;
};

export default function IntelligenceCopilot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "copilot",
      content: "I am Dayflow Intelligence. I analyze context across attendance, leave, payroll, and compliance. How can I help you today?",
    }
  ]);
  const [input, setInput] = useState("");

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userQuery = input.trim();
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: userQuery }]);
    setInput("");

    // Mock copilot response
    setTimeout(() => {
      let response: React.ReactNode = "I'm analyzing the HR graph. I don't have enough context to answer that right now.";

      if (userQuery.toLowerCase().includes("rahul") || userQuery.toLowerCase().includes("late")) {
        response = (
          <div className={styles.richResponse}>
            <p>I detected an anomaly for <strong>Rahul Sharma</strong> regarding consecutive late arrivals.</p>
            <div className={styles.contextBox}>
              <span className={styles.contextLabel}>Context Graph:</span>
              <ul>
                <li>3 consecutive Mondays arriving late (avg. 45 mins)</li>
                <li>Performance remains at 94% (High)</li>
                <li>No overlapping leave requests</li>
              </ul>
            </div>
            <p><strong>Recommendation:</strong> Schedule a 1:1 check-in. The pattern suggests a scheduling conflict rather than a performance issue.</p>
          </div>
        );
      } else if (userQuery.toLowerCase().includes("policy") || userQuery.toLowerCase().includes("maternity")) {
        response = "According to the updated 2026 Employee Handbook (v2.1), maternity leave has been extended to 26 weeks for primary caregivers. Would you like me to draft an email to the engineering team regarding this update?";
      }

      setMessages(prev => [...prev, { id: Date.now().toString() + "-ai", role: "copilot", content: response }]);
    }, 1200);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>INTELLIGENCE</h1>
        <p className={styles.subtitle}>
          Contextual queries across the organizational graph.
        </p>
      </header>

      <div className={styles.chatInterface}>
        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div key={msg.id} className={`${styles.messageWrapper} ${msg.role === "user" ? styles.msgUser : styles.msgCopilot}`}>
              {msg.role === "copilot" && <div className={styles.avatarAi}>◈</div>}
              <div className={styles.messageBubble}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className={styles.inputArea}>
          <input
            type="text"
            className={styles.textInput}
            placeholder="Ask about anomalies, employee context, or policy implications..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className={styles.sendBtn} disabled={!input.trim()}>
            Query Graph
          </button>
        </form>
      </div>
    </div>
  );
}
