import { useNavigate } from 'react-router-dom'

type StatCard = {
  label: string
  value: string
  delta: string
}

const stats: StatCard[] = [
  { label: 'ผู้ลงทะเบียนวันนี้', value: '128', delta: '+12 จากเมื่อวาน' },
  { label: 'ลงเวลาสำเร็จ', value: '114', delta: 'อัปเดตล่าสุด 2 นาทีที่แล้ว' },
  { label: 'สาย', value: '9', delta: 'ต้องติดตามผล' },
  { label: 'ขาดงาน', value: '5', delta: 'รอการยืนยัน' },
]

function UserDashboardPage() {
  const navigate = useNavigate()

  return (
    <>
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
          <button type="button" className="primary-button" onClick={() => navigate('/user/check-in')}>
            ไปหน้าลงชื่อเข้าทำงาน
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate('/user/history')}>
            ดูประวัติ
          </button>
        </div>
        <p className="helper-text">เส้นทางนี้ยังคงใช้ flow เดิมสำหรับ camera + GPS + device</p>
      </section>
    </>
  )
}

export default UserDashboardPage