import styles from "./page.module.css";
import Link from "next/link";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const activeTab = params?.tab || "engine";

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>SYSTEM CONFIGURATION</h1>
        <p className={styles.subtitle}>Global parameters and integration protocols.</p>
      </header>

      <div className={styles.layout}>
        {/* SIDEBAR TABS */}
        <div className={styles.sidebar}>
          <Link href="?tab=engine" className={`${styles.tabBtn} ${activeTab === 'engine' ? styles.tabBtnActive : ''}`}>
            DAYFLOW AI ENGINE
          </Link>
          <Link href="?tab=policies" className={`${styles.tabBtn} ${activeTab === 'policies' ? styles.tabBtnActive : ''}`}>
            HR POLICIES
          </Link>
          <Link href="?tab=integrations" className={`${styles.tabBtn} ${activeTab === 'integrations' ? styles.tabBtnActive : ''}`}>
            INTEGRATIONS
          </Link>
          <Link href="?tab=security" className={`${styles.tabBtn} ${activeTab === 'security' ? styles.tabBtnActive : ''}`}>
            SECURITY & ACCESS
          </Link>
        </div>

        {/* CONTENT AREA */}
        <div className={`spatial-panel-raised ${styles.contentArea}`}>
          
          {activeTab === 'engine' && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Dayflow AI Engine</h2>
                <p className={styles.sectionDesc}>Configure anomaly detection sensitivity and intelligence thresholds.</p>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Anomaly Detection Sensitivity</label>
                  <span className={styles.valueBadge}>HIGH (85%)</span>
                </div>
                <p className={styles.helpText}>Determines how strictly the AI flags late arrivals and missing check-outs.</p>
                <input type="range" className={styles.slider} min="1" max="100" defaultValue="85" />
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Pulse Survey Frequency</label>
                </div>
                <p className={styles.helpText}>How often automated check-ins are sent to offline employees.</p>
                <div style={{display: 'flex', gap: 8}}>
                  <button className={`${styles.btnAction} ${styles.btnActionActive}`}>DAILY</button>
                  <button className={styles.btnAction}>WEEKLY</button>
                  <button className={styles.btnAction}>MONTHLY</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'policies' && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Global HR Policies</h2>
                <p className={styles.sectionDesc}>Baseline rules applied to all new personnel profiles.</p>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Default Annual Leave Quota</label>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <input type="number" className={styles.input} defaultValue="24" />
                  <span className={styles.helpText} style={{marginBottom: 0}}>Days / Year</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Standard Operations Window</label>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12}}>
                  <input type="time" className={styles.input} defaultValue="09:00" />
                  <span className={styles.helpText} style={{marginBottom: 0}}>UNTIL</span>
                  <input type="time" className={styles.input} defaultValue="17:00" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>External Integrations</h2>
                <p className={styles.sectionDesc}>Webhooks and third-party operational links.</p>
              </div>

              <div className={styles.integrationItem}>
                <div className={styles.intDetails}>
                  <div className={styles.intIcon} style={{color: '#E34F26'}}>S</div>
                  <div>
                    <div className={styles.intName}>Slack Operational Webhook</div>
                    <div className={styles.intStatus}>Connected to #hr-alerts</div>
                  </div>
                </div>
                <button className={`${styles.btnAction} ${styles.btnActionActive}`}>CONFIGURED</button>
              </div>

              <div className={styles.integrationItem}>
                <div className={styles.intDetails}>
                  <div className={styles.intIcon} style={{color: '#0052CC'}}>J</div>
                  <div>
                    <div className={styles.intName}>Jira Ticketing</div>
                    <div className={styles.intStatus}>Not configured</div>
                  </div>
                </div>
                <button className={styles.btnAction}>CONNECT</button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Security & Access</h2>
                <p className={styles.sectionDesc}>Authentication protocols and administrator overrides.</p>
              </div>

              <div className={styles.formGroup}>
                <div className={styles.toggleRow}>
                  <div>
                    <label className={styles.label}>Require Two-Factor Authentication (2FA)</label>
                    <p className={styles.helpText} style={{marginBottom: 0, marginTop: 4}}>Enforce MFA for all directory personnel.</p>
                  </div>
                  <div className={`${styles.toggle} ${styles.toggleOn}`}>
                    <div className={styles.toggleKnob}></div>
                  </div>
                </div>
              </div>

              <div className={styles.formGroup} style={{marginTop: 48, paddingTop: 32, borderTop: '1px dashed var(--border-subtle)'}}>
                <div className={styles.labelRow}>
                  <label className={styles.label} style={{color: 'var(--status-critical)'}}>DANGER ZONE</label>
                </div>
                <p className={styles.helpText}>Irreversible destructive actions.</p>
                <button className={styles.btnAction} style={{borderColor: 'var(--status-critical)', color: 'var(--status-critical)'}}>
                  RESET ADMINISTRATOR PROTOCOLS
                </button>
              </div>
            </div>
          )}

          <div className={styles.saveAction}>
            <button className={styles.btnSave}>COMMIT CHANGES</button>
          </div>
        </div>

      </div>
    </div>
  );
}
