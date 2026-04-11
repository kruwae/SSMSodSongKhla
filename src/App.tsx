import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type StatCard = {
  label: string
  value: string
  delta: string
}

type AttendanceRow = {
  name: string
  status: string
  time: string
  department: string
}

const stats: StatCard[] = [
  { label: 'ผู้ลงทะเบียนวันนี้', value: '128', delta: '+12 จากเมื่อวาน' },
  { label: 'ลงเวลาสำเร็จ', value: '114', delta: 'อัปเดตล่าสุด 2 นาทีที่แล้ว' },
  { label: 'สาย', value: '9', delta: 'ต้องติดตามผล' },
  { label: 'ขาดงาน', value: '5', delta: 'รอการยืนยัน' },
]

const attendanceRows: AttendanceRow[] = [
  { name: 'กานต์ธิดา ใจดี', status: 'ปกติ', time: '08:02', department: 'งานทะเบียน' },
  { name: 'ณัฐวุฒิ พรหมมา', status: 'สาย', time: '08:26', department: 'งานอาคารสถานที่' },
  { name: 'สุภาวดี แสงทอง', status: 'ปฏิบัติหน้าที่เวร', time: '07:45', department: 'งานการเงิน' },
  { name: 'อาทิตย์ มั่นคง', status: 'กลับก่อนเวลา', time: '15:10', department: 'งานบุคคล' },
]

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle')
  const [cameraMessage, setCameraMessage] = useState('กดปุ่มเพื่อเริ่มใช้งานกล้องสำหรับลงชื่อเข้าใช้')
  const [checkedIn, setCheckedIn] = useState(32)

  const today = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }, [])

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraStatus('idle')
    setCameraMessage('หยุดการใช้งานกล้องแล้ว')
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error')
      setCameraMessage('เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้อง')
      return
    }

    try {
      setCameraStatus('starting')
      setCameraMessage('กำลังเปิดกล้อง...')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      setCameraStatus('active')
      setCameraMessage('กล้องพร้อมใช้งานสำหรับลงชื่อเข้าใช้')
      setCheckedIn((current) => current + 1)
    } catch {
      setCameraStatus('error')
      setCameraMessage('ไม่สามารถเปิดกล้องได้ โปรดตรวจสอบสิทธิ์การใช้งาน')
    }
  }

  return (
    <div className="index-page">
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-mark">SSM</div>
          <div>
            <h1>Attendance</h1>
            <p>ระบบลงเวลาเข้าเรียน/งาน</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="#overview" className="nav-item active">ภาพรวม</a>
          <a href="#sign-in" className="nav-item">ลงชื่อเข้าใช้</a>
          <a href="#records" className="nav-item">รายการวันนี้</a>
          <a href="#reports" className="nav-item">รายงานสรุป</a>
        </nav>

        <div className="sidebar-card">
          <p className="sidebar-card-label">สถานะระบบ</p>
          <strong>พร้อมใช้งาน</strong>
          <span>Local demo mode</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            aria-label="เปิดเมนู"
            onClick={() => setSidebarOpen((current) => !current)}
          >
            ☰
          </button>
          <div>
            <p className="eyebrow">SSM Attendance Dashboard</p>
            <h2>แดชบอร์ดลงเวลา</h2>
          </div>
          <div className="topbar-meta">
            <span>{today}</span>
          </div>
        </header>

        <section id="overview" className="stats-grid">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <p>{stat.label}</p>
              <h3>{stat.value}</h3>
              <span>{stat.delta}</span>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <article id="sign-in" className="panel sign-in-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Mobile Sign-in</p>
                <h3>ลงชื่อเข้าใช้งานด้วยกล้อง</h3>
              </div>
              <span className={`status-pill status-${cameraStatus}`}>{cameraStatus === 'active' ? 'ใช้งานอยู่' : cameraStatus === 'starting' ? 'กำลังเปิด' : cameraStatus === 'error' ? 'ผิดพลาด' : 'พร้อม'}</span>
            </div>

            <div className="camera-box">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-fallback">
                <p>พื้นที่แสดงภาพจากกล้อง</p>
                <span>{cameraMessage}</span>
              </div>
            </div>

            <div className="panel-actions">
              <button type="button" className="primary-button" onClick={startCamera} disabled={cameraStatus === 'starting'}>
                {cameraStatus === 'starting' ? 'กำลังเปิดกล้อง...' : 'Start Camera'}
              </button>
              <button type="button" className="secondary-button" onClick={stopCamera}>
                Stop Camera
              </button>
            </div>

            <p className="helper-text">{cameraMessage}</p>
          </article>

          <article id="records" className="panel records-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Today Records</p>
                <h3>รายการลงเวลาล่าสุด</h3>
              </div>
              <span className="mini-chip">ลงแล้ว {checkedIn} คน</span>
            </div>

            <div className="table-wrap">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>ชื่อ</th>
                    <th>แผนก</th>
                    <th>เวลา</th>
                    <th>สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRows.map((row) => (
                    <tr key={`${row.name}-${row.time}`}>
                      <td>{row.name}</td>
                      <td>{row.department}</td>
                      <td>{row.time}</td>
                      <td>
                        <span className={`status-pill status-${row.status}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>
        </section>

        <section id="reports" className="panel summary-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Summary</p>
              <h3>ภาพรวมการปฏิบัติงาน</h3>
            </div>
          </div>

          <div className="summary-grid">
            <div>
              <span>เช็กอินสำเร็จ</span>
              <strong>89%</strong>
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
      </main>
    </div>
  )
}

export default App
