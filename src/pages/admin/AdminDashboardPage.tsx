export type AdminDashboardPageProps = {
  today: string
}

function AdminDashboardPage({ today }: AdminDashboardPageProps) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h2>แดชบอร์ดผู้ดูแลระบบ</h2>
        </div>
        <div className="topbar-meta">
          <span>{today}</span>
        </div>
      </header>

      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Summary</p>
            <h3>ภาพรวมระบบ</h3>
          </div>
        </div>

        <div className="summary-grid">
          <div>
            <span>อุปกรณ์รออนุมัติ</span>
            <strong>14 รายการ</strong>
          </div>
          <div>
            <span>ผู้ใช้งานทั้งหมด</span>
            <strong>128 คน</strong>
          </div>
          <div>
            <span>จุดลงเวลา</span>
            <strong>7 จุด</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage