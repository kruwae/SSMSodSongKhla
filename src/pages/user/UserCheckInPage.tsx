import { useState } from 'react'
import { attendanceRows } from '../../data/attendanceRows'
import { useCheckInFlow } from '../../hooks/useCheckInFlow'

function UserCheckInPage() {
  const {
    videoRef,
    cameraStatus,
    cameraMessage,
    checkedIn,
    signInStep,
    faceVerified,
    locationVerified,
    deviceVerified,
    deviceInput,
    setDeviceInput,
    serviceUnit,
    setServiceUnit,
    gpsMessage,
    distanceMeters,
    gpsPrecision,
    currentCoords,
    registeredDevice,
    deviceApprovalMessage,
    deviceChangePending,
    adminApprovalGranted,
    imeiChecked,
    saveStatus,
    startCamera,
    captureFace,
    registerDevice,
    requestDeviceVerification,
    autoCheckImei,
    approveDeviceChange,
    resetFlow,
    saveToGoogleSheet,
  } = useCheckInFlow()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const signInStatusLabel =
    signInStep === 'success' ? 'สำเร็จ' : signInStep === 'submitting' ? 'กำลังบันทึก' : signInStep === 'error' ? 'ผิดพลาด' : 'พร้อม'

  const signInStatusClass =
    signInStep === 'success' ? 'active' : signInStep === 'error' ? 'error' : signInStep === 'submitting' ? 'starting' : 'idle'

  const gpsDistanceLabel = distanceMeters !== null ? `${distanceMeters.toFixed(1)} เมตร` : '-'
  const coordsLabel = currentCoords ? `${currentCoords.lat.toFixed(12)}, ${currentCoords.lng.toFixed(12)}` : '-'
  const approvalLabel = adminApprovalGranted ? 'แอดมินยืนยันแล้ว' : deviceChangePending ? 'รอยืนยันจากแอดมิน' : 'พร้อมใช้งาน'
  const saveStatusLabel =
    saveStatus === 'idle' ? 'รอบันทึก' : saveStatus === 'saving' ? 'กำลังบันทึก' : saveStatus === 'saved' ? 'บันทึกแล้ว' : 'บันทึกไม่สำเร็จ'
  const helperText = registeredDevice
    ? signInStep === 'deviceCode'
      ? 'กรอกรหัสอุปกรณ์/IMEI ที่ลงทะเบียนไว้ หากไม่ตรงกับอุปกรณ์เดิม ระบบจะขึ้นสถานะรอแอดมินยืนยัน'
      : 'ต้องผ่านใบหน้าและ GPS ก่อนจึงจะกรอกรหัสอุปกรณ์ได้'
    : 'ต้องลงทะเบียนอุปกรณ์และระบุหน่วยบริการก่อน จึงจะเริ่มลงชื่อทำงานได้'

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
              <span className={`status-pill status-${signInStatusClass}`}>{signInStatusLabel}</span>
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
              <p><strong>ระยะ:</strong> {gpsDistanceLabel}</p>
              <p><strong>พิกัด 12 ตำแหน่ง:</strong> {coordsLabel}</p>
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
              <p className="helper-text">{helperText}</p>
            </div>

            <div className="info-card">
              <p><strong>สถานะอุปกรณ์:</strong> {deviceApprovalMessage}</p>
              <p><strong>หน่วยบริการ:</strong> {registeredDevice?.serviceUnit || serviceUnit || '-'}</p>
              <p><strong>สถานะอนุมัติ:</strong> {approvalLabel}</p>
              <p><strong>IMEI ตรวจแล้ว:</strong> {imeiChecked ? 'ผ่าน' : 'ยังไม่ตรวจ'}</p>
              <p><strong>สถานะบันทึก:</strong> {saveStatusLabel}</p>
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

export default UserCheckInPage