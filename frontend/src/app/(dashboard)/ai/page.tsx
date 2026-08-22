import styles from "./page.module.css";

export default function DayflowAI() {
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
          
          <div className={`${styles.message} ${styles.messageSystem}`}>
            <div className={`${styles.avatar} ${styles.avatarAi}`}>✧</div>
            <div className={`${styles.bubble} ${styles.bubbleSystem}`}>
              Good afternoon! I'm Dayflow AI. I've analyzed your Command Center metrics. 
              <br/><br/>
              Did you know your Engineering department's attendance trend is up 4% this week? How can I help you today?
            </div>
          </div>

        </div>

        <div className={styles.inputArea}>
          <input 
            type="text" 
            placeholder="e.g. Generate a payroll summary for August 2026..." 
            className={styles.input}
          />
          <button className={styles.sendBtn}>Send ↗</button>
        </div>
      </div>
    </div>
  );
}
