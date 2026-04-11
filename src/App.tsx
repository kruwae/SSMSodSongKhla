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

type SignInStep = 'idle' | 'face' | 'location' | 'deviceCode' | 'submitting' | 'success' | 'error'

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

const SCHOOL_LAT = 6.564080
const SCHOOL_LNG = 101.388390
const MAX_DISTANCE_METERS = 20

function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const locationWatchRef = useRef<number | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [cameraStatus, setCameraStatus] = useState<'idle' | 'starting' | 'active' | 'error'>('idle')
  const [cameraMessage, setCameraMessage] = useState('กดปุ่มเพื่อเริ่มสแกนใบหน้า')
  const [checkedIn, setCheckedIn] = useState(32)
  const [signInStep, setSignInStep] = useState<SignInStep>('idle')
  const [faceVerified, setFaceVerified] = useState(false)
  const [locationVerified, setLocationVerified] = useState(false)
  const [deviceVerified, setDeviceVerified] = useState(false)
  const [deviceCode] = useState('123456')
  const [deviceInput, setDeviceInput] = useState('')
  const [gpsMessage, setGpsMessage] = useState('ยังไม่ได้ตรวจจับตำแหน่ง')
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null)
  const [gpsPrecision, setGpsPrecision] = useState<'12-digit' | '6-digit'>('12-digit')
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null)

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

  const resetFlow = () => {
    setSignInStep('idle')
    setFaceVerified(false)
    setLocationVerified(false)
    setDeviceVerified(false)
    setDeviceInput('')
    setGpsMessage('ยังไม่ได้ตรวจจับตำแหน่ง')
    setDistanceMeters(null)
    setCurrentCoords(null)
    setCameraMessage('กดปุ่มเพื่อเริ่มสแกนใบหน้า')
    stopCamera()
  }

  useEffect(() => {
    return () => {
      if (locationWatchRef.current !== null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(locationWatchRef.current)
      }
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('error')
      setCameraMessage('เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้อง')
      setSignInStep('error')
      return
    }

    try {
      setCameraStatus('starting')
      setCameraMessage('กำลังเปิดกล้องเพื่อสแกนใบหน้า...')
      setSignInStep('face')
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
      setCameraMessage('กล้องพร้อมใช้งาน: จัดหน้าให้อยู่ในกรอบเพื่อสแกนใบหน้า')
    } catch {
      setCameraStatus('error')
      setCameraMessage('ไม่สามารถเปิดกล้องได้ โปรดตรวจสอบสิทธิ์การใช้งาน')
      setSignInStep('error')
    }
  }

  const captureFace = () => {
    setFaceVerified(true)
    setSignInStep('location')
    setCameraMessage('สแกนใบหน้าผ่านแล้ว กำลังตรวจ GPS...')
    requestLocation()
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setGpsMessage('อุปกรณ์นี้ไม่รองรับ GPS')
      setSignInStep('error')
      return
    }

    setGpsMessage('กำลังตรวจตำแหน่ง...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const meters = haversineMeters(lat, lng, SCHOOL_LAT, SCHOOL_LNG)

        setCurrentCoords({ lat, lng })
        setDistanceMeters(meters)
        setGpsPrecision(position.coords.accuracy <= 10 ? '12-digit' : '6-digit')

        if (meters <= MAX_DISTANCE_METERS) {
          setLocationVerified(true)
          setGpsMessage(`ผ่าน GPS: อยู่ห่าง ${meters.toFixed(1)} เมตร | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`)
          setSignInStep('deviceCode')
          setCameraMessage('ผ่าน GPS แล้ว กรุณากรอกรหัสโทรศัพท์/รหัสเครื่องที่ลงทะเบียน')
        } else {
          setLocationVerified(false)
          setGpsMessage(`ไม่ผ่าน GPS: อยู่ห่าง ${meters.toFixed(1)} เมตร เกิน ${MAX_DISTANCE_METERS} เมตร | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`)
          setSignInStep('error')
          setCameraMessage('ตรวจ GPS ไม่ผ่าน')
        }
      },
      (error) => {
        setGpsMessage(error.message || 'ไม่สามารถดึงตำแหน่งได้')
        setLocationVerified(false)
        setSignInStep('error')
        setCameraMessage('ตรวจ GPS ไม่ผ่าน')
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const verifyDeviceCode = () => {
    const input = deviceInput.trim()
    if (!input) {
      setDeviceVerified(false)
      setCameraMessage('กรุณากรอกรหัสโทรศัพท์/รหัสเครื่อง')
      return
    }

    if (input === deviceCode) {
      setDeviceVerified(true)
      setSignInStep('submitting')
      setCameraMessage('ตรวจสอบรหัสผ่านแล้ว กำลังส่งลงชื่อเข้าใช้งาน...')
      setTimeout(() => {
        setCameraStatus('active')
        setCheckedIn((current) => current + 1)
        setSignInStep('success')
        setCameraMessage('ลงชื่อสำเร็จ')
      }, 800)
    } else {
      setDeviceVerified(false)
      setSignInStep('error')
      setCameraMessage('รหัสโทรศัพท์/รหัสเครื่องไม่ถูกต้อง')
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
          <span>Location + Face + Device flow</span>
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

        <section className="panel action-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Action</p>
              <h3>กดปุ่มนี้เพื่อเริ่มลงชื่อเข้าทำงาน</h3>
            </div>
          </div>
          <div className="panel-actions">
            <button
              type="button"
              className="primary-button"
              onClick={startCamera}
              disabled={cameraStatus === 'starting'}
            >
              เปิดกล้องสำหรับลงชื่อเข้าทำงาน
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={captureFace}
              disabled={signInStep !== 'face' || cameraStatus !== 'active'}
            >
              ลงชื่อเข้าทำงาน
            </button>
          </div>
          <p className="helper-text">
            เมื่อเปิดกล้องแล้ว ระบบจะตรวจใบหน้า + GPS + IMEI ของอุปกรณ์ตามลำดับ
          </p>
        </section>

        <section className="content-grid">
          <article id="sign-in" className="panel sign-in-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Mobile Sign-in</p>
                <h3>ลงชื่อเข้าใช้งานด้วย Face + GPS + Device Code</h3>
              </div>
              <span className={`status-pill status-${signInStep === 'success' ? 'active' : signInStep === 'error' ? 'error' : signInStep === 'submitting' ? 'starting' : 'idle'}`}>
                {signInStep === 'success'
                  ? 'สำเร็จ'
                  : signInStep === 'submitting'
                    ? 'กำลังบันทึก'
                    : signInStep === 'error'
                      ? 'ผิดพลาด'
                      : 'พร้อม'}
              </span>
            </div>

            <div className="stepper">
              <div className={`step ${signInStep === 'face' || faceVerified ? 'done' : ''}`}>
                <strong>1</strong>
                <span>สแกนใบหน้า</span>
              </div>
              <div className={`step ${(signInStep === 'location' || locationVerified || deviceVerified) ? 'done' : ''}`}>
                <strong>2</strong>
                <span>ตรวจ GPS ≤ 20 ม.</span>
              </div>
              <div className={`step ${deviceVerified ? 'done' : ''}`}>
                <strong>3</strong>
                <span>รหัสโทรศัพท์/เครื่อง</span>
              </div>
            </div>

            <div className="camera-box">
              <video ref={videoRef} autoPlay playsInline muted className="camera-video" />
              <div className="camera-fallback">
                <p>พื้นที่แสดงภาพจากกล้อง</p>
                <span>{cameraMessage}</span>
              </div>
            </div>

            <div className="panel-actions">
              <button
                type="button"
                className="primary-button"
                onClick={startCamera}
                disabled={cameraStatus === 'starting' || signInStep === 'submitting'}
              >
                {cameraStatus === 'starting' ? 'กำลังเปิดกล้อง...' : 'เปิดกล้องสำหรับลงชื่อเข้าใช้'}
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={captureFace}
                disabled={signInStep !== 'face' || cameraStatus !== 'active'}
              >
                ลงชื่อเข้าทำงาน
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={() => {
                  if (!deviceVerified) {
                    setDeviceInput('')
                  }
                }}
              >
                ลงทะเบียนอุปกรณ์
              </button>
              <button type="button" className="secondary-button" onClick={resetFlow}>
                รีเซ็ตฟลูว์
              </button>
            </div>

            <div className="checklist">
              <div className={faceVerified ? 'check done' : 'check'}>✓ ใบหน้า</div>
              <div className={locationVerified ? 'check done' : 'check'}>✓ GPS</div>
              <div className={deviceVerified ? 'check done' : 'check'}>✓ IMEI / รหัสอุปกรณ์</div>
            </div>

            <div className="info-card">
              <p><strong>สถานะ GPS:</strong> {gpsMessage}</p>
              <p><strong>ระยะ:</strong> {distanceMeters !== null ? `${distanceMeters.toFixed(1)} เมตร` : '-'}</p>
              <p><strong>พิกัด 12 ตำแหน่ง:</strong> {currentCoords ? `${currentCoords.lat.toFixed(12)}, ${currentCoords.lng.toFixed(12)}` : '-'}</p>
              <p><strong>ความละเอียด:</strong> {gpsPrecision}</p>
            </div>

            <div className="device-code-box">
              <label htmlFor="device-code">IMEI / รหัสอุปกรณ์ที่ลงทะเบียน</label>
              <input
                id="device-code"
                type="text"
                value={deviceInput}
                onChange={(event) => setDeviceInput(event.target.value)}
                placeholder="กรอก IMEI หรือรหัสอุปกรณ์"
                disabled={signInStep !== 'deviceCode'}
              />
              <button
                type="button"
                className="primary-button"
                onClick={verifyDeviceCode}
                disabled={signInStep !== 'deviceCode' || !deviceInput.trim()}
              >
                ยืนยันอุปกรณ์
              </button>
              <p className="helper-text">
                {signInStep === 'deviceCode'
                  ? 'กรอกรหัสอุปกรณ์/IMEI ที่ลงทะเบียนไว้ หากยังไม่ลงทะเบียนให้กดปุ่มลงทะเบียนอุปกรณ์ก่อน'
                  : 'ต้องผ่านใบหน้าและ GPS ก่อนจึงจะกรอกรหัสอุปกรณ์ได้'}
              </p>
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
