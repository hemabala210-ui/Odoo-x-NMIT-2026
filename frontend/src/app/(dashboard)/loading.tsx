export default function DashboardLoading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '24px',
      height: 'calc(100vh - 80px)'
    }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
        <div className="neo-skeleton" style={{ height: '36px', width: '250px', borderRadius: '8px' }}></div>
        <div className="neo-skeleton" style={{ height: '20px', width: '350px', borderRadius: '8px' }}></div>
      </div>
      
      {/* Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="neo-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div className="neo-skeleton" style={{ width: '48px', height: '48px', borderRadius: '50%' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div className="neo-skeleton" style={{ height: '20px', width: '60%', borderRadius: '4px' }}></div>
                <div className="neo-skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }}></div>
              </div>
            </div>
            <div className="neo-skeleton" style={{ height: '100px', width: '100%', borderRadius: '12px' }}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
