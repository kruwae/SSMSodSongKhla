import { type Dispatch, type MutableRefObject, type SetStateAction } from 'react'

export type SignInStep = 'idle' | 'face' | 'location' | 'deviceCode' | 'submitting' | 'success' | 'error'

export type RegisteredDevice = {
  id: string
  name: string
  imei: string
  owner: string
  serviceUnit: string
  gpsEnabled: boolean
  scanEnabled: boolean
  approved: boolean
}

export type CheckInPageProps = {
  videoRef: MutableRefObject<HTMLVideoElement | null>
  cameraStatus: 'idle' | 'starting' | 'active' | 'error'
  cameraMessage: string
  signInStep: SignInStep
  faceVerified: boolean
  locationVerified: boolean
  deviceVerified: boolean
  deviceInput: string
  setDeviceInput: Dispatch<SetStateAction<string>>
  serviceUnit: string
  setServiceUnit: Dispatch<SetStateAction<string>>
  gpsMessage: string
  distanceMeters: number | null
  gpsPrecision: '12-digit' | '6-digit'
  currentCoords: { lat: number; lng: number } | null
  registeredDevice: RegisteredDevice | null
  deviceApprovalMessage: string
  deviceChangePending: boolean
  adminApprovalGranted: boolean
  imeiChecked: boolean
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  checkedIn: number
  onStartCamera: () => void
  onCaptureFace: () => void
  onRegisterDevice: () => void
  onVerifyDeviceCode: () => void
  onAutoCheckImei: () => void
  onApproveDeviceChange: () => void
  onResetFlow: () => void
  onSaveToGoogleSheet: () => void
}

function CheckInPage({
  videoRef,
  cameraStatus,
  cameraMessage,
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
  checkedIn,
  onStartCamera,
  onCaptureFace,
  onRegisterDevice,
  onVerifyDeviceCode,
  onAutoCheckImei,
  onApproveDeviceChange,
  onResetFlow,
  onSaveToGoogleSheet,
}: CheckInPageProps) {
  return (
    <article className="panel sign-in-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Mobile Sign-in</p>
          <h3>ลงชื่อเข้าใช้งานด้วย Face + GPS + Device Code</h3>
        </div>
        <span
          className={`status-pill status-${signInStep === 'success' ? 'active' : signInStep === 'error' ? 'error' : signInStep === 'submitting' ? 'starting' : 'idle'}`}
        >
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
        <button
          type="button"
          className="secondary-button"
          onClick={onRegisterDevice}
          disabled={!!registeredDevice}
        >
          {registeredDevice ? 'ลงทะเบียนอุปกรณ์แล้ว' : 'ลงทะเบียนอุปกรณ์'}
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={onStartCamera}
          disabled={!registeredDevice || cameraStatus === 'starting' || signInStep === 'submitting'}
        >
          เปิดกล้องสำหรับลงชื่อเข้าใช้
        </button>
        <button
          type="button"
          className="primary-button"
          onClick={onCaptureFace}
          disabled={!registeredDevice || signInStep !== 'face' || cameraStatus !== 'active'}
        >
          ลงชื่อเข้าทำงาน
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={onAutoCheckImei}
          disabled={!registeredDevice || !deviceInput.trim() || signInStep !== 'deviceCode'}
        >
          ตรวจรหัสเครื่องอัตโนมัติ
        </button>
        <button
          type="button"
          className="secondary-button"
          onClick={onApproveDeviceChange}
          disabled={!deviceChangePending || !deviceInput.trim() || !deviceInput.trim().length}
        >
          แอดมินยืนยันอุปกรณ์
        </button>
        <button type="button" className="secondary-button" onClick={onResetFlow}>
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
        <button
          type="button"
          className="primary-button"
          onClick={onVerifyDeviceCode}
          disabled={!registeredDevice || signInStep !== 'deviceCode' || !deviceInput.trim()}
        >
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
        <p><strong>จำนวนลงเวลา:</strong> {checkedIn}</p>
      </div>

      {faceVerified && locationVerified && imeiChecked && adminApprovalGranted && (
        <div className="panel-actions">
          <button type="button" className="primary-button" onClick={onSaveToGoogleSheet} disabled={saveStatus === 'saving'}>
            บันทึกลง Google Sheet
          </button>
        </div>
      )}

      <p className="helper-text">{cameraMessage}</p>
    </article>
  )
}

export default CheckInPage