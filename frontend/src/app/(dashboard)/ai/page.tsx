"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function DayflowAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "1",
      role: "system",
      content: "Good afternoon! I'm Dayflow AI. I have live access to your PostgreSQL database. Ask me about an employee's history, attendance trends, or system anomalies."
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage.content })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch response");
      }

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "system",
        content: data.response
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "system",
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          ✧ Dayflow AI
          <span className={styles.badge}>BETA</span>
        </h1>
        <p className={styles.subtitle}>Ask questions about your organization, attendance trends, or payroll analytics.</p>
      </header>

      <div className={styles.chatBox}>
        <div className={styles.messageList}>
          {messages.map(msg => (
            <div key={msg.id} className={`${styles.message} ${msg.role === 'system' ? styles.messageSystem : styles.messageUser}`}>
              {msg.role === 'system' && <div className={`${styles.avatar} ${styles.avatarAi}`}>✧</div>}
              {msg.role === 'user' && <div className={`${styles.avatar} ${styles.avatarUser}`}>U</div>}
              
              <div className={`${styles.bubble} ${msg.role === 'system' ? styles.bubbleSystem : styles.bubbleUser}`}>
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className={`${styles.message} ${styles.messageSystem}`}>
              <div className={`${styles.avatar} ${styles.avatarAi}`}>✧</div>
              <div className={`${styles.bubble} ${styles.bubbleSystem}`}>
                <span className="spatial-skeleton" style={{ width: '100px', height: '16px', display: 'inline-block' }}></span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          <input 
            type="text" 
            placeholder="e.g. What is the progress of Alice Johnson?" 
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
          />
          <button 
            className={styles.sendBtn} 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? "..." : "Send ↗"}
          </button>
        </div>
      </div>
    </div>
  );
}
