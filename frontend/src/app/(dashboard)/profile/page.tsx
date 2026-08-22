export default function ProfilePlaceholder() {
  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <h1 className="text-heading" style={{ fontSize: '28px', marginBottom: '8px' }}>Admin Profile</h1>
      <p className="text-secondary" style={{ marginBottom: "32px" }}>
        Manage your personal account settings and preferences.
      </p>

      <div className="spatial-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            background: 'var(--accent-primary)', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '32px', fontWeight: '500' 
          }}>
            A
          </div>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '500', color: 'var(--text-primary)' }}>Admin User</h2>
            <p style={{ color: 'var(--text-secondary)' }}>HR Administrator</p>
          </div>
        </div>

        <p className="text-secondary">
          Profile management is currently under construction.
        </p>
      </div>
    </div>
  );
}
