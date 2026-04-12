import { type ReactNode } from 'react'

export type StatCard = {
  label: string
  value: string
  delta: string
}

export type UserDashboardPageProps = {
  today: string
  stats: StatCard[]
  checkedIn: number
  onStartCheckIn: () => void
  actionSlot?: ReactNode
}

function UserDashboardPage({
  today,
  stats,
  checkedIn,
  onStartCheckIn,
  actionSlot,
}: UserDashboardPageProps) {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SSM Attendance Dashboard</p>
          <h2>แดชบอร์ดลงเวลา</h2>
        </div>
        <div className="topbar-meta">
          <span>{today}</span>
        </div>
      </header>

      <section className="stats-grid">
        {stats.map((stat) => (
          <article className="stat-card" key={stat.label}>
            <p>{stat.label}</p>
            <h3>{stat.value}</h3>
            <span>{stat.delta}</span>
          </article>
        ))}
      </section>

      <section className="panel action-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Action</p>
            <h3>กดปุ่มนี้เพื่อเริ่มลงชื่อเข้าทำงาน</h3>
          </div>
        </div>
        <div className="panel-actions">
          <button type="button" className="primary-button" onClick={onStartCheckIn}>
            เปิดกล้องสำหรับลงชื่อเข้าทำงาน
          </button>
        </div>
        <p className="helper-text">เมื่อเปิดกล้องแล้ว ระบบจะตรวจใบหน้า + GPS + IMEI ของอุปกรณ์ตามลำดับ</p>
        {actionSlot}
      </section>

      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Summary</p>
            <h3>ภาพรวมการปฏิบัติงาน</h3>
          </div>
        </div>

        <div className="summary-grid">
          <div>
            <span>เช็กอินสำเร็จ</span>
            <strong>{Math.max(checkedIn, 0)} คน</strong>
          </div>
          <div>
            <span>ตรวจสอบด้วยกล้อง</span>
            <strong>72%</strong>
          </div>
          <div>
            <span>รออนุมัติ</span>
            <strong>14 รายการ</strong>
          </div>
        </div>
      </section>
    </div>
  )
}

export default UserDashboardPage