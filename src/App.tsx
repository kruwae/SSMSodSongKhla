import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import RoleNav from './components/RoleNav'
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

type AppRole = 'user' | 'admin'

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

type RegisteredDevice = {
  id: string
  name: string
  imei: string
  owner: string
  serviceUnit: string
  gpsEnabled: boolean
  scanEnabled: boolean
  approved: boolean
}

const storedDeviceSeed = {
  imei: '123456',
  name: 'มือถือเจ้าหน้าที่เวรเช้า',
  owner: 'สุภาวดี แสงทอง',
  serviceUnit: 'หน่วยบริการ A',
  gpsEnabled: true,
  scanEnabled: true,
}

const SCHOOL_LAT = 6.56405379821
const SCHOOL_LNG = 101.38833639069
const MAX_DISTANCE_METERS = 70
const MIN_ACCURACY_METERS = 100

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

export function ProtectedRoute({ role }: { role: AppRole }) {
  const location = useLocation()
  const pathname = location.pathname

  if (role === 'user' && !pathname.startsWith('/user')) {
    return <Navigate to="/user" replace />
  }

  if (role === 'admin' && !pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="index-page">
      <main className="main-content">
        <section className="panel summary-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Login</p>
              <h3>เลือกการใช้งาน</h3>
            </div>
          </div>
          <div className="panel-actions">
            <button type="button" className="primary-button" onClick={() => navigate('/user')}>
              เข้าสู่ระบบผู้ใช้งาน
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate('/admin')}>
              เข้าสู่ระบบผู้ดูแลระบบ
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function RouteShell({ role }: { role: AppRole }) {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdmin = role === 'admin'
  const today = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }, [])

  return (
    <div className="index-page">
      <div className="sidebar-overlay" onClick={() => void 0} aria-hidden="true" />
      <aside className="sidebar open">
        <div className="sidebar-header">
          <div className="brand-mark">SSM</div>
          <div>
            <h1>Attendance</h1>
            <p>{isAdmin ? 'ระบบผู้ดูแล' : 'ระบบผู้ใช้งาน'}</p>
          </div>
        </div>

        <RoleNav
          mode={isAdmin ? 'admin' : 'user'}
          activePath={location.pathname}
          onNavigate={() => undefined}
        />

        <div className="sidebar-card">
          <p className="sidebar-card-label">สถานะระบบ</p>
          <strong>{isAdmin ? 'Admin mode' : 'User mode'}</strong>
          <span>{today}</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button type="button" className="menu-button" aria-label="กลับหน้า login" onClick={() => navigate('/login')}>
            ⟵
          </button>
          <div>
            <p className="eyebrow">{isAdmin ? 'Admin Routing' : 'User Routing'}</p>
            <h2>{isAdmin ? 'หน้าผู้ดูแลระบบ' : 'หน้าผู้ใช้งาน'}</h2>
          </div>
          <div className="topbar-meta">
            <span>{today}</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}

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

function UserCheckInPage() {
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
  const [deviceInput, setDeviceInput] = useState('')
  const [serviceUnit, setServiceUnit] = useState('')
  const [gpsMessage, setGpsMessage] = useState('ยังไม่ได้ตรวจจับตำแหน่ง')
  const [distanceMeters, setDistanceMeters] = useState<number | null>(null)
  const [gpsPrecision, setGpsPrecision] = useState<'12-digit' | '6-digit'>('12-digit')
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [registeredDevice, setRegisteredDevice] = useState<RegisteredDevice | null>(null)
  const [deviceApprovalMessage, setDeviceApprovalMessage] = useState('ยังไม่ได้ลงทะเบียนอุปกรณ์')
  const [deviceChangePending, setDeviceChangePending] = useState(false)
  const [adminApprovalGranted, setAdminApprovalGranted] = useState(false)
  const [imeiChecked, setImeiChecked] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    return () => {
      if (locationWatchRef.current !== null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(locationWatchRef.current)
      }
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
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

  const captureDeviceFingerprint = () => ({
    imei: storedDeviceSeed.imei,
    name: storedDeviceSeed.name,
    owner: storedDeviceSeed.owner,
    serviceUnit: storedDeviceSeed.serviceUnit,
    gpsEnabled: storedDeviceSeed.gpsEnabled,
    scanEnabled: storedDeviceSeed.scanEnabled,
  })

  const registerDevice = () => {
    const fingerprint = captureDeviceFingerprint()
    if (!serviceUnit.trim()) {
      setDeviceApprovalMessage('กรุณาระบุหน่วยบริการก่อนลงทะเบียนอุปกรณ์')
      setCameraMessage('ต้องระบุหน่วยบริการก่อนจึงจะลงทะเบียนอุปกรณ์ได้')
      return
    }

    const newDevice: RegisteredDevice = {
      id: `DEV-${Date.now()}`,
      ...fingerprint,
      approved: true,
    }
    setRegisteredDevice(newDevice)
    setDeviceVerified(true)
    setDeviceChangePending(false)
    setAdminApprovalGranted(false)
    setDeviceApprovalMessage(`บันทึกอุปกรณ์เริ่มต้นแล้ว: ${newDevice.name} (${newDevice.imei}) | หน่วยบริการ: ${serviceUnit.trim()}`)
    setCameraMessage('ลงทะเบียนอุปกรณ์สำเร็จ และตั้งเป็นค่าเริ่มต้นของบัญชีนี้')
  }

  const requestDeviceVerification = () => {
    const input = deviceInput.trim()
    if (!input) {
      setDeviceVerified(false)
      setCameraMessage('กรุณากรอกรหัสโทรศัพท์/รหัสเครื่อง')
      return
    }

    if (!registeredDevice) {
      setDeviceVerified(false)
      setDeviceApprovalMessage('ยังไม่ลงทะเบียนอุปกรณ์ กรุณาลงทะเบียนอุปกรณ์ก่อน')
      setCameraMessage('ต้องลงทะเบียนอุปกรณ์ก่อนจึงจะลงชื่อทำงานได้')
      return
    }

    const currentDevice = registeredDevice ?? null
    if (!currentDevice) {
      setDeviceVerified(false)
      setDeviceApprovalMessage('ยังไม่พบอุปกรณ์ที่ลงทะเบียน')
      setCameraMessage('กรุณาลงทะเบียนอุปกรณ์ก่อน')
      return
    }

    if (input === currentDevice.imei) {
      setDeviceVerified(true)
      setDeviceChangePending(false)
      setDeviceApprovalMessage('อุปกรณ์ตรงกับที่ลงทะเบียนไว้ ใช้งานได้')
      setSignInStep('submitting')
      setCameraMessage('ตรวจสอบอุปกรณ์ผ่านแล้ว กำลังส่งลงชื่อเข้าใช้งาน...')
      setTimeout(() => {
        setCameraStatus('active')
        setCheckedIn((current) => current + 1)
        setSignInStep('success')
        setCameraMessage('ลงชื่อสำเร็จ')
      }, 800)
      return
    }

    setDeviceVerified(false)
    setDeviceChangePending(true)
    setDeviceApprovalMessage(`อุปกรณ์ไม่ตรงกับที่ลงทะเบียนไว้ | หน่วยบริการเดิม: ${registeredDevice.serviceUnit} | รอแอดมินยืนยัน`)
    setSignInStep('error')
    setCameraMessage('อุปกรณ์ไม่ตรงกับที่ลงทะเบียนไว้ รอแอดมินยืนยัน')
  }

  const approveDeviceChange = () => {
    const input = deviceInput.trim()
    if (!input) return
    setAdminApprovalGranted(true)
    setDeviceVerified(true)
    setDeviceChangePending(false)
    setDeviceApprovalMessage('แอดมินยืนยันการเปลี่ยนแปลงอุปกรณ์แล้ว')
    setCameraMessage('แอดมินอนุมัติอุปกรณ์ สามารถลงชื่อได้')
    setRegisteredDevice((current) =>
      current
        ? {
            ...current,
            imei: input,
            approved: true,
          }
        : current,
    )
  }

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
      setCameraMessage('ตรวจ GPS ไม่ผ่าน: อุปกรณ์ไม่รองรับตำแหน่ง')
      return
    }

    setGpsMessage('กำลังตรวจตำแหน่ง...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const accuracy = position.coords.accuracy
        const meters = haversineMeters(lat, lng, SCHOOL_LAT, SCHOOL_LNG)

        setCurrentCoords({ lat, lng })
        setDistanceMeters(meters)
        setGpsPrecision(accuracy <= 10 ? '12-digit' : '6-digit')

        if (accuracy > MIN_ACCURACY_METERS) {
          setLocationVerified(false)
          setGpsMessage(`พิกัดยังไม่นิ่งพอ (accuracy ${accuracy.toFixed(1)}m) | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`)
          setSignInStep('error')
          setCameraMessage('ตรวจ GPS ไม่ผ่าน: ความแม่นยำของพิกัดยังไม่พอ')
          return
        }

        if (meters <= MAX_DISTANCE_METERS) {
          setLocationVerified(true)
          setGpsMessage(`ผ่าน GPS: อยู่ห่าง ${meters.toFixed(1)} เมตร | accuracy ${accuracy.toFixed(1)}m | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`)
          setSignInStep('deviceCode')
          setCameraMessage('ผ่าน GPS แล้ว กรุณากรอกรหัสโทรศัพท์/รหัสเครื่องที่ลงทะเบียน')
        } else {
          setLocationVerified(false)
          setGpsMessage(`ไม่ผ่าน GPS: อยู่ห่าง ${meters.toFixed(1)} เมตร เกิน ${MAX_DISTANCE_METERS} เมตร | accuracy ${accuracy.toFixed(1)}m | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`)
          setSignInStep('error')
          setCameraMessage('ตรวจ GPS ไม่ผ่าน: พิกัดอยู่นอกพื้นที่กำหนด')
        }
      },
      (error) => {
        const reason =
          error.code === error.PERMISSION_DENIED
            ? 'ไม่ได้อนุญาตให้เข้าถึงตำแหน่ง'
            : error.code === error.POSITION_UNAVAILABLE
              ? 'ไม่สามารถระบุตำแหน่งได้'
              : error.code === error.TIMEOUT
                ? 'หมดเวลารอข้อมูลตำแหน่ง'
                : error.message || 'ไม่สามารถดึงตำแหน่งได้'

        setGpsMessage(`ตรวจ GPS ไม่ผ่าน: ${reason}`)
        setLocationVerified(false)
        setSignInStep('error')
        setCameraMessage(`ตรวจ GPS ไม่ผ่าน: ${reason}`)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const autoCheckImei = () => {
    const input = deviceInput.trim()
    if (!registeredDevice || !input) return
    const passed = input === registeredDevice.imei
    setImeiChecked(passed)
    setCameraMessage(passed ? 'ตรวจ IMEI อัตโนมัติผ่านแล้ว' : 'ตรวจ IMEI อัตโนมัติไม่ผ่าน')
  }

  const saveToGoogleSheet = async () => {
    setSaveStatus('saving')
    try {
      const response = await fetch('https://script.google.com/macros/s/REPLACE_WITH_YOUR_WEB_APP_URL/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: new Date().toISOString(),
          deviceId: registeredDevice?.id ?? '',
          imei: deviceInput.trim(),
          imeiChecked,
          faceVerified,
          locationVerified,
          adminApprovalGranted,
          gpsMessage,
          distanceMeters,
          serviceUnit: registeredDevice?.serviceUnit || serviceUnit,
        }),
      })

      if (!response.ok) throw new Error('save failed')
      setSaveStatus('saved')
      setCameraMessage('บันทึกข้อมูลลง Google Sheet สำเร็จ')
    } catch {
      setSaveStatus('error')
      setCameraMessage('บันทึกลง Google Sheet ไม่สำเร็จ')
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
          <button type="button" className="nav-item active">ภาพรวม</button>
          <button type="button" className="nav-item">ลงชื่อเข้าใช้</button>
          <button type="button" className="nav-item">รายการวันนี้</button>
          <button type="button" className="nav-item">รายงานสรุป</button>
        </nav>

        <div className="sidebar-card">
          <p className="sidebar-card-label">สถานะระบบ</p>
          <strong>พร้อมใช้งาน</strong>
          <span>Location + Face + Device flow</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button type="button" className="menu-button" aria-label="เปิดเมนู" onClick={() => setSidebarOpen((current) => !current)}>
            ☰
          </button>
          <div>
            <p className="eyebrow">SSM Attendance Dashboard</p>
            <h2>แดชบอร์ดลงเวลา</h2>
          </div>
          <div className="topbar-meta">
            <span>Route: /user/check-in</span>
          </div>
        </header>

        <section className="panel action-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Action</p>
              <h3>กดปุ่มนี้เพื่อเริ่มลงชื่อเข้าทำงาน</h3>
            </div>
          </div>
          <div className="panel-actions">
            <button type="button" className="primary-button" onClick={startCamera} disabled={cameraStatus === 'starting'}>
              เปิดกล้องสำหรับลงชื่อเข้าทำงาน
            </button>
            <button type="button" className="secondary-button" onClick={captureFace} disabled={signInStep !== 'face' || cameraStatus !== 'active'}>
              ลงชื่อเข้าทำงาน
            </button>
          </div>
          <p className="helper-text">เมื่อเปิดกล้องแล้ว ระบบจะตรวจใบหน้า + GPS + IMEI ของอุปกรณ์ตามลำดับ</p>
        </section>

        <section className="content-grid">
          <article className="panel sign-in-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Mobile Sign-in</p>
                <h3>ลงชื่อเข้าใช้งานด้วย Face + GPS + Device Code</h3>
              </div>
              <span className={`status-pill status-${signInStep === 'success' ? 'active' : signInStep === 'error' ? 'error' : signInStep === 'submitting' ? 'starting' : 'idle'}`}>
                {signInStep === 'success' ? 'สำเร็จ' : signInStep === 'submitting' ? 'กำลังบันทึก' : signInStep === 'error' ? 'ผิดพลาด' : 'พร้อม'}
              </span>
            </div>

            <div className="stepper">
              <div className={`step ${signInStep === 'face' || faceVerified ? 'done' : ''}`}>
                <strong>1</strong>
                <span>สแกนใบหน้า</span>
              </div>
              <div className={`step ${(signInStep === 'location' || locationVerified || deviceVerified) ? 'done' : ''}`}>
                <strong>2</strong>
                <span>ตรวจ GPS ≤ 70 ม.</span>
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
              <button type="button" className="secondary-button" onClick={registerDevice} disabled={!!registeredDevice}>
                {registeredDevice ? 'ลงทะเบียนอุปกรณ์แล้ว' : 'ลงทะเบียนอุปกรณ์'}
              </button>
              <button type="button" className="primary-button" onClick={startCamera} disabled={!registeredDevice || cameraStatus === 'starting' || signInStep === 'submitting'}>
                เปิดกล้องสำหรับลงชื่อเข้าใช้
              </button>
              <button type="button" className="primary-button" onClick={captureFace} disabled={!registeredDevice || signInStep !== 'face' || cameraStatus !== 'active'}>
                ลงชื่อเข้าทำงาน
              </button>
              <button type="button" className="secondary-button" onClick={autoCheckImei} disabled={!registeredDevice || !deviceInput.trim() || signInStep !== 'deviceCode'}>
                ตรวจรหัสเครื่องอัตโนมัติ
              </button>
              <button type="button" className="secondary-button" onClick={approveDeviceChange} disabled={!deviceChangePending || !deviceInput.trim() || !deviceInput.trim().length}>
                แอดมินยืนยันอุปกรณ์
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
              <label htmlFor="service-unit">ระบุหน่วยบริการ</label>
              <input
                id="service-unit"
                type="text"
                value={serviceUnit}
                onChange={(event) => setServiceUnit(event.target.value)}
                placeholder="เช่น หน่วยบริการ A"
                disabled={!!registeredDevice}
              />
            </div>

            <div className="device-code-box">
              <label htmlFor="device-code">IMEI / รหัสอุปกรณ์ที่ลงทะเบียน</label>
              <input
                id="device-code"
                type="text"
                value={deviceInput}
                onChange={(event) => setDeviceInput(event.target.value)}
                placeholder="กรอก IMEI หรือรหัสอุปกรณ์"
                disabled={!registeredDevice || signInStep !== 'deviceCode'}
              />
              <button type="button" className="primary-button" onClick={requestDeviceVerification} disabled={!registeredDevice || signInStep !== 'deviceCode' || !deviceInput.trim()}>
                ยืนยันอุปกรณ์
              </button>
              <p className="helper-text">
                {registeredDevice
                  ? signInStep === 'deviceCode'
                    ? 'กรอกรหัสอุปกรณ์/IMEI ที่ลงทะเบียนไว้ หากไม่ตรงกับอุปกรณ์เดิม ระบบจะขึ้นสถานะรอแอดมินยืนยัน'
                    : 'ต้องผ่านใบหน้าและ GPS ก่อนจึงจะกรอกรหัสอุปกรณ์ได้'
                  : 'ต้องลงทะเบียนอุปกรณ์และระบุหน่วยบริการก่อน จึงจะเริ่มลงชื่อทำงานได้'}
              </p>
            </div>

            <div className="info-card">
              <p><strong>สถานะอุปกรณ์:</strong> {deviceApprovalMessage}</p>
              <p><strong>หน่วยบริการ:</strong> {registeredDevice?.serviceUnit || serviceUnit || '-'}</p>
              <p><strong>สถานะอนุมัติ:</strong> {adminApprovalGranted ? 'แอดมินยืนยันแล้ว' : deviceChangePending ? 'รอยืนยันจากแอดมิน' : 'พร้อมใช้งาน'}</p>
              <p><strong>IMEI ตรวจแล้ว:</strong> {imeiChecked ? 'ผ่าน' : 'ยังไม่ตรวจ'}</p>
              <p><strong>สถานะบันทึก:</strong> {saveStatus === 'idle' ? 'รอบันทึก' : saveStatus === 'saving' ? 'กำลังบันทึก' : saveStatus === 'saved' ? 'บันทึกแล้ว' : 'บันทึกไม่สำเร็จ'}</p>
            </div>

            {faceVerified && locationVerified && imeiChecked && adminApprovalGranted && (
              <div className="panel-actions">
                <button type="button" className="primary-button" onClick={saveToGoogleSheet} disabled={saveStatus === 'saving'}>
                  บันทึกลง Google Sheet
                </button>
              </div>
            )}

            <p className="helper-text">{cameraMessage}</p>
          </article>

          <article className="panel records-panel">
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
      </main>
    </div>
  )
}

function UserHistoryPage() {
  return (
    <section className="panel summary-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">History</p>
          <h3>ประวัติการลงเวลา</h3>
        </div>
      </div>
      <p className="helper-text">หน้าประวัติพร้อมเชื่อมข้อมูลจริงในขั้นถัดไป</p>
    </section>
  )
}

function AdminDashboardPage() {
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

      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Admin Overview</p>
            <h3>ภาพรวมผู้ดูแลระบบ</h3>
          </div>
        </div>
        <p className="helper-text">หน้านี้เป็น shell สำหรับฝั่งแอดมิน และยังคงโครงสร้างเดิมของแอปไว้</p>
      </section>
    </>
  )
}

function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <section className="panel summary-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Admin</p>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="helper-text">หน้าชั่วคราวสำหรับการต่อยอด CRUD ในรอบถัดไป</p>
    </section>
  )
}

function App() {
  return null
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/user" element={<RouteShell role="user" />}>
          <Route index element={<UserDashboardPage />} />
          <Route path="check-in" element={<UserCheckInPage />} />
          <Route path="history" element={<UserHistoryPage />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<RouteShell role="admin" />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminPlaceholderPage title="จัดการผู้ใช้" />} />
          <Route path="devices" element={<AdminPlaceholderPage title="จัดการอุปกรณ์" />} />
          <Route path="locations" element={<AdminPlaceholderPage title="จัดการสถานที่" />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
