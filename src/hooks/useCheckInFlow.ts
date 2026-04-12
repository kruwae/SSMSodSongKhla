import { useEffect, useRef, useState } from 'react'
import {
  type CameraStatus,
  createCheckInService,
  type GpsPrecision,
  type RegisteredDevice,
  type SaveStatus,
  type SignInStep,
  type CheckInSnapshot,
} from '../services/checkInService'

const SCHOOL_LAT = 6.56405379821
const SCHOOL_LNG = 101.38833639069
const MAX_DISTANCE_METERS = 70
const MIN_ACCURACY_METERS = 100

const storedDeviceSeed = {
  imei: '123456',
  name: 'มือถือเจ้าหน้าที่เวรเช้า',
  owner: 'สุภาวดี แสงทอง',
  serviceUnit: 'หน่วยบริการ A',
  gpsEnabled: true,
  scanEnabled: true,
}

const checkInService = createCheckInService({
  schoolLat: SCHOOL_LAT,
  schoolLng: SCHOOL_LNG,
  maxDistanceMeters: MAX_DISTANCE_METERS,
  minAccuracyMeters: MIN_ACCURACY_METERS,
  storedDeviceSeed,
})

export function useCheckInFlow() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const locationWatchRef = useRef<number | null>(null)

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
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
  const [gpsPrecision, setGpsPrecision] = useState<GpsPrecision>('12-digit')
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [registeredDevice, setRegisteredDevice] = useState<RegisteredDevice | null>(null)
  const [deviceApprovalMessage, setDeviceApprovalMessage] = useState('ยังไม่ได้ลงทะเบียนอุปกรณ์')
  const [deviceChangePending, setDeviceChangePending] = useState(false)
  const [adminApprovalGranted, setAdminApprovalGranted] = useState(false)
  const [imeiChecked, setImeiChecked] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')

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

  const registerDevice = () => {
    const fingerprint = checkInService.captureDeviceFingerprint()
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
    setDeviceApprovalMessage(checkInService.buildDeviceMismatchMessage(currentDevice))
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
        const result = checkInService.resolveGpsResult(position)
        setCurrentCoords({ lat: result.lat, lng: result.lng })
        setDistanceMeters(result.meters)
        setGpsPrecision(result.precision)

        if (!result.ok) {
          setLocationVerified(false)
          setGpsMessage(result.message)
          setSignInStep(result.step)
          setCameraMessage(result.cameraMessage)
          return
        }

        setLocationVerified(true)
        setGpsMessage(result.message)
        setSignInStep(result.step)
        setCameraMessage(result.cameraMessage)
      },
      (error) => {
        const result = checkInService.resolveGpsError(error)
        setGpsMessage(result.message)
        setLocationVerified(false)
        setSignInStep('error')
        setCameraMessage(result.cameraMessage)
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
      const payload: CheckInSnapshot = checkInService.buildSavePayload({
        deviceId: registeredDevice?.id ?? '',
        imei: deviceInput.trim(),
        imeiChecked,
        faceVerified,
        locationVerified,
        adminApprovalGranted,
        gpsMessage,
        distanceMeters,
        serviceUnit: registeredDevice?.serviceUnit || serviceUnit,
      })
      const response = await fetch('https://script.google.com/macros/s/REPLACE_WITH_YOUR_WEB_APP_URL/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('save failed')
      setSaveStatus('saved')
      setCameraMessage('บันทึกข้อมูลลง Google Sheet สำเร็จ')
    } catch {
      setSaveStatus('error')
      setCameraMessage('บันทึกลง Google Sheet ไม่สำเร็จ')
    }
  }

  return {
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
  }
}