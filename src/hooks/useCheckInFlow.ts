import { useEffect, useMemo, useReducer, useRef } from 'react'
import {
  type CameraStatus,
  createCheckInService,
  DEFAULT_MAX_DISTANCE_METERS,
  DEFAULT_MIN_ACCURACY_METERS,
  DEFAULT_SCHOOL_LAT,
  DEFAULT_SCHOOL_LNG,
  DEFAULT_STORED_DEVICE_SEED,
  type GpsPrecision,
  type RegisteredDevice,
  type SaveStatus,
  type SignInStep,
  type CheckInSnapshot,
} from '../services/checkInService'
import { apiClient } from '../services/api'

const serviceUnitLocationMap: Record<string, { lat: number; lng: number }> = {
  อาคารสำนักงานหลัก: { lat: 6.56405379821, lng: 101.38833639069 },
  'หน่วยบริการ A': { lat: 6.56405379821, lng: 101.38833639069 },
  'หน่วยบริการ B': { lat: 6.56405379821, lng: 101.38833639069 },
  'Work From Home': { lat: 6.647581014685428, lng: 101.30647939321433 },
}

const getSelectedServiceUnitLocation = (serviceUnit: string) =>
  serviceUnitLocationMap[serviceUnit] ?? null


type CheckInState = {
  cameraStatus: CameraStatus
  cameraMessage: string
  checkedIn: number
  signInStep: SignInStep
  faceVerified: boolean
  locationVerified: boolean
  deviceVerified: boolean
  deviceInput: string
  serviceUnit: string
  gpsMessage: string
  distanceMeters: number | null
  gpsPrecision: GpsPrecision
  currentCoords: { lat: number; lng: number } | null
  registeredDevice: RegisteredDevice | null
  deviceApprovalMessage: string
  deviceChangePending: boolean
  adminApprovalGranted: boolean
  imeiChecked: boolean
  saveStatus: SaveStatus
}

type CheckInAction =
  | { type: 'CAMERA_STARTING' }
  | { type: 'CAMERA_ACTIVE'; message: string }
  | { type: 'CAMERA_ERROR'; message: string }
  | { type: 'CAMERA_IDLE'; message: string }
  | { type: 'FACE_VERIFIED'; message: string }
  | { type: 'LOCATION_PENDING'; message: string }
  | {
      type: 'LOCATION_RESULT'
      message: string
      gpsMessage: string
      locationVerified: boolean
      signInStep: SignInStep
      currentCoords: { lat: number; lng: number } | null
      distanceMeters: number | null
      gpsPrecision: GpsPrecision
    }
  | { type: 'DEVICE_INPUT_CHANGED'; value: string }
  | { type: 'SERVICE_UNIT_CHANGED'; value: string }
  | { type: 'REGISTER_DEVICE'; device: RegisteredDevice; message: string }
  | { type: 'DEVICE_VERIFIED'; message: string }
  | { type: 'DEVICE_MISMATCH'; message: string; deviceChangePending: boolean }
  | { type: 'ADMIN_DEVICE_APPROVED'; message: string; device: RegisteredDevice }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; message: string }
  | { type: 'SAVE_ERROR'; message: string }
  | { type: 'RESET_FLOW' }
  | { type: 'CHECKED_IN_INCREMENTED' }
  | { type: 'IMEI_CHECKED'; passed: boolean; message: string }

const initialState: CheckInState = {
  cameraStatus: 'idle',
  cameraMessage: 'กดปุ่มเพื่อเริ่มสแกนใบหน้า',
  checkedIn: 32,
  signInStep: 'idle',
  faceVerified: false,
  locationVerified: false,
  deviceVerified: false,
  deviceInput: '',
  serviceUnit: '',
  gpsMessage: 'ยังไม่ได้ตรวจจับตำแหน่ง',
  distanceMeters: null,
  gpsPrecision: '12-digit',
  currentCoords: null,
  registeredDevice: null,
  deviceApprovalMessage: 'ยังไม่ได้ลงทะเบียนอุปกรณ์',
  deviceChangePending: false,
  adminApprovalGranted: false,
  imeiChecked: false,
  saveStatus: 'idle',
}

function reducer(state: CheckInState, action: CheckInAction): CheckInState {
  switch (action.type) {
    case 'CAMERA_STARTING':
      return {
        ...state,
        cameraStatus: 'starting',
        cameraMessage: 'กำลังเปิดกล้องเพื่อสแกนใบหน้า...',
        signInStep: 'face',
      }
    case 'CAMERA_ACTIVE':
      return {
        ...state,
        cameraStatus: 'active',
        cameraMessage: action.message,
      }
    case 'CAMERA_ERROR':
      return {
        ...state,
        cameraStatus: 'error',
        cameraMessage: action.message,
        signInStep: 'error',
      }
    case 'CAMERA_IDLE':
      return {
        ...state,
        cameraStatus: 'idle',
        cameraMessage: action.message,
      }
    case 'FACE_VERIFIED':
      return {
        ...state,
        faceVerified: true,
        signInStep: 'location',
        cameraMessage: action.message,
      }
    case 'LOCATION_PENDING':
      return {
        ...state,
        gpsMessage: action.message,
      }
    case 'LOCATION_RESULT':
      return {
        ...state,
        gpsMessage: action.gpsMessage,
        locationVerified: action.locationVerified,
        signInStep: action.signInStep,
        cameraMessage: action.message,
        currentCoords: action.currentCoords,
        distanceMeters: action.distanceMeters,
        gpsPrecision: action.gpsPrecision,
      }
    case 'DEVICE_INPUT_CHANGED':
      return {
        ...state,
        deviceInput: action.value,
      }
    case 'SERVICE_UNIT_CHANGED': {
      const mappedLocation = serviceUnitLocationMap[action.value]
      return {
        ...state,
        serviceUnit: action.value,
        currentCoords: mappedLocation
          ? { lat: mappedLocation.lat, lng: mappedLocation.lng }
          : null,
        gpsMessage: mappedLocation
          ? `พิกัดอ้างอิงของหน่วยบริการ: ${mappedLocation.lat.toFixed(12)}, ${mappedLocation.lng.toFixed(12)}`
          : 'ยังไม่ได้ตรวจจับตำแหน่ง',
      }
    }
    case 'REGISTER_DEVICE':
      return {
        ...state,
        registeredDevice: action.device,
        deviceVerified: false,
        deviceChangePending: false,
        adminApprovalGranted: false,
        imeiChecked: false,
        signInStep: 'deviceCode',
        deviceApprovalMessage: `บันทึกอุปกรณ์เริ่มต้นแล้ว: ${action.device.name} (${action.device.imei}) | หน่วยบริการ: ${action.device.serviceUnit}`,
        cameraMessage: action.message,
      }
    case 'DEVICE_VERIFIED':
      return {
        ...state,
        deviceVerified: true,
        deviceChangePending: false,
        adminApprovalGranted: true,
        imeiChecked: true,
        deviceApprovalMessage: 'อุปกรณ์ตรงกับที่ลงทะเบียนไว้ ใช้งานได้',
        signInStep: 'idle',
        cameraMessage: action.message,
      }
    case 'DEVICE_MISMATCH':
      return {
        ...state,
        deviceVerified: false,
        deviceChangePending: action.deviceChangePending,
        deviceApprovalMessage: action.message,
        signInStep: 'error',
        cameraMessage: 'อุปกรณ์ไม่ตรงกับที่ลงทะเบียนไว้ รอแอดมินยืนยัน',
      }
    case 'ADMIN_DEVICE_APPROVED':
      return {
        ...state,
        adminApprovalGranted: true,
        deviceVerified: true,
        deviceChangePending: false,
        imeiChecked: true,
        signInStep: 'idle',
        deviceApprovalMessage: 'แอดมินยืนยันการเปลี่ยนแปลงอุปกรณ์แล้ว',
        cameraMessage: action.message,
        registeredDevice: action.device,
      }
    case 'SAVE_START':
      return {
        ...state,
        saveStatus: 'saving',
      }
    case 'SAVE_SUCCESS':
      return {
        ...state,
        saveStatus: 'saved',
        cameraMessage: action.message,
      }
    case 'SAVE_ERROR':
      return {
        ...state,
        saveStatus: 'error',
        cameraMessage: action.message,
      }
    case 'RESET_FLOW':
      return {
        ...initialState,
        checkedIn: state.checkedIn,
      }
    case 'CHECKED_IN_INCREMENTED':
      return {
        ...state,
        checkedIn: state.checkedIn + 1,
        locationVerified: true,
        signInStep: 'success',
        cameraStatus: 'active',
        cameraMessage: 'ลงชื่อสำเร็จ',
      }
    case 'IMEI_CHECKED':
      return {
        ...state,
        imeiChecked: action.passed,
        cameraMessage: action.message,
      }
    default:
      return state
  }
}

export function useCheckInFlow() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const locationWatchRef = useRef<number | null>(null)
  const signInTimerRef = useRef<number | null>(null)

  const [state, dispatch] = useReducer(reducer, initialState)

  const checkInService = useMemo(
    () =>
      createCheckInService({
        schoolLat: DEFAULT_SCHOOL_LAT,
        schoolLng: DEFAULT_SCHOOL_LNG,
        maxDistanceMeters: DEFAULT_MAX_DISTANCE_METERS,
        minAccuracyMeters: DEFAULT_MIN_ACCURACY_METERS,
        getTargetLocation: () => getSelectedServiceUnitLocation(state.serviceUnit),
        storedDeviceSeed: DEFAULT_STORED_DEVICE_SEED,
      }),
    [state.serviceUnit],
  )

  useEffect(() => {
    return () => {
      if (locationWatchRef.current !== null && navigator.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(locationWatchRef.current)
      }
      if (signInTimerRef.current !== null) {
        window.clearTimeout(signInTimerRef.current)
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
    dispatch({ type: 'CAMERA_IDLE', message: 'หยุดการใช้งานกล้องแล้ว' })
  }

  const resetFlow = () => {
    if (signInTimerRef.current !== null) {
      window.clearTimeout(signInTimerRef.current)
      signInTimerRef.current = null
    }
    dispatch({ type: 'RESET_FLOW' })
    stopCamera()
  }

  const registerDevice = () => {
    const fingerprint = checkInService.captureDeviceFingerprint()
    if (!state.serviceUnit.trim()) {
      dispatch({
        type: 'CAMERA_ERROR',
        message: 'ต้องระบุหน่วยบริการก่อนจึงจะลงทะเบียนอุปกรณ์ได้',
      })
      return
    }

    const newDevice: RegisteredDevice = {
      id: `DEV-${Date.now()}`,
      ...fingerprint,
      serviceUnit: state.serviceUnit.trim(),
      approved: true,
    }

    dispatch({
      type: 'REGISTER_DEVICE',
      device: newDevice,
      message: 'ลงทะเบียนอุปกรณ์สำเร็จ และตั้งเป็นค่าเริ่มต้นของบัญชีนี้',
    })
  }

  const requestDeviceVerification = () => {
    const input = state.deviceInput.trim()
    if (!input) {
      dispatch({ type: 'DEVICE_INPUT_CHANGED', value: state.deviceInput })
      dispatch({ type: 'CAMERA_ERROR', message: 'กรุณากรอกรหัสโทรศัพท์/รหัสเครื่อง' })
      return
    }

    if (!state.serviceUnit.trim()) {
      dispatch({ type: 'CAMERA_ERROR', message: 'กรุณาเลือกหน่วยบริหารก่อนยืนยันรหัสเครื่อง' })
      return
    }

    if (!state.registeredDevice) {
      dispatch({
        type: 'DEVICE_MISMATCH',
        message: 'ยังไม่ลงทะเบียนอุปกรณ์ กรุณาลงทะเบียนอุปกรณ์ก่อน',
        deviceChangePending: false,
      })
      return
    }

    if (input === state.registeredDevice.imei) {
      dispatch({
        type: 'DEVICE_VERIFIED',
        message: 'ตรวจสอบอุปกรณ์ผ่านแล้ว สามารถเปิดกล้องและลงชื่อทำงานได้',
      })
      return
    }

    dispatch({
      type: 'DEVICE_MISMATCH',
      message: checkInService.buildDeviceMismatchMessage(state.registeredDevice),
      deviceChangePending: true,
    })
  }

  const approveDeviceChange = () => {
    const input = state.deviceInput.trim()
    if (!input || !state.registeredDevice) return

    dispatch({
      type: 'ADMIN_DEVICE_APPROVED',
      device: {
        ...state.registeredDevice,
        imei: input,
        approved: true,
      },
      message: 'แอดมินอนุมัติอุปกรณ์ สามารถลงชื่อได้',
    })
  }

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      dispatch({
        type: 'CAMERA_ERROR',
        message: 'เบราว์เซอร์นี้ไม่รองรับการเข้าถึงกล้อง',
      })
      return
    }

    try {
      dispatch({ type: 'CAMERA_STARTING' })
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      dispatch({
        type: 'CAMERA_ACTIVE',
        message: 'กล้องพร้อมใช้งาน: จัดหน้าให้อยู่ในกรอบเพื่อสแกนใบหน้า',
      })
    } catch {
      dispatch({
        type: 'CAMERA_ERROR',
        message: 'ไม่สามารถเปิดกล้องได้ โปรดตรวจสอบสิทธิ์การใช้งาน',
      })
    }
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      dispatch({
        type: 'LOCATION_RESULT',
        message: 'ตรวจ GPS ไม่ผ่าน: อุปกรณ์ไม่รองรับตำแหน่ง',
        gpsMessage: 'อุปกรณ์นี้ไม่รองรับ GPS',
        locationVerified: false,
        signInStep: 'error',
        currentCoords: null,
        distanceMeters: null,
        gpsPrecision: state.gpsPrecision,
      })
      return
    }

    dispatch({ type: 'LOCATION_PENDING', message: 'กำลังตรวจตำแหน่ง...' })
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result = checkInService.resolveGpsResult(position)
        dispatch({
          type: 'LOCATION_RESULT',
          message: result.cameraMessage,
          gpsMessage: result.message,
          locationVerified: result.ok,
          signInStep: result.step,
          currentCoords: { lat: result.lat, lng: result.lng },
          distanceMeters: result.meters,
          gpsPrecision: result.precision,
        })
      },
      (error) => {
        const result = checkInService.resolveGpsError(error)
        dispatch({
          type: 'LOCATION_RESULT',
          message: result.cameraMessage,
          gpsMessage: result.message,
          locationVerified: false,
          signInStep: 'error',
          currentCoords: null,
          distanceMeters: null,
          gpsPrecision: state.gpsPrecision,
        })
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const captureFace = () => {
    if (!state.registeredDevice || !state.deviceVerified) {
      dispatch({
        type: 'CAMERA_ERROR',
        message: 'ต้องลงทะเบียนเครื่องและยืนยันรหัสเครื่องให้ผ่านก่อน',
      })
      return
    }

    dispatch({
      type: 'FACE_VERIFIED',
      message: 'สแกนใบหน้าผ่านแล้ว กำลังตรวจ GPS...',
    })
    requestLocation()
  }

  const autoCheckImei = () => {
    const input = state.deviceInput.trim()
    if (!state.registeredDevice || !input) return
    const passed = input === state.registeredDevice.imei
    dispatch({
      type: 'IMEI_CHECKED',
      passed,
      message: passed ? 'ตรวจ IMEI อัตโนมัติผ่านแล้ว' : 'ตรวจ IMEI อัตโนมัติไม่ผ่าน',
    })
  }

  const saveToGoogleSheet = async () => {
    dispatch({ type: 'SAVE_START' })
    try {
      const payload: CheckInSnapshot = checkInService.buildSavePayload({
        deviceId: state.registeredDevice?.id ?? '',
        imei: state.deviceInput.trim(),
        imeiChecked: state.imeiChecked,
        faceVerified: state.faceVerified,
        locationVerified: state.locationVerified,
        adminApprovalGranted: state.adminApprovalGranted,
        gpsMessage: state.gpsMessage,
        distanceMeters: state.distanceMeters,
        serviceUnit: state.registeredDevice?.serviceUnit || state.serviceUnit,
      })
      const response = await apiClient.saveCheckIn(payload)
      if (!response.saved) throw new Error(response.message)
      dispatch({ type: 'CHECKED_IN_INCREMENTED' })
      dispatch({ type: 'SAVE_SUCCESS', message: 'บันทึกข้อมูลลงเซิร์ฟเวอร์สำเร็จ' })
    } catch {
      dispatch({ type: 'SAVE_ERROR', message: 'บันทึกข้อมูลลงเซิร์ฟเวอร์ไม่สำเร็จ' })
    }
  }

  const api = useMemo(
    () => ({
      videoRef,
      cameraStatus: state.cameraStatus,
      cameraMessage: state.cameraMessage,
      checkedIn: state.checkedIn,
      signInStep: state.signInStep,
      faceVerified: state.faceVerified,
      locationVerified: state.locationVerified,
      deviceVerified: state.deviceVerified,
      deviceInput: state.deviceInput,
      setDeviceInput: (value: string) => dispatch({ type: 'DEVICE_INPUT_CHANGED', value }),
      serviceUnit: state.serviceUnit,
      setServiceUnit: (value: string) => dispatch({ type: 'SERVICE_UNIT_CHANGED', value }),
      gpsMessage: state.gpsMessage,
      distanceMeters: state.distanceMeters,
      gpsPrecision: state.gpsPrecision,
      currentCoords: state.currentCoords,
      registeredDevice: state.registeredDevice,
      deviceApprovalMessage: state.deviceApprovalMessage,
      deviceChangePending: state.deviceChangePending,
      adminApprovalGranted: state.adminApprovalGranted,
      imeiChecked: state.imeiChecked,
      saveStatus: state.saveStatus,
      startCamera,
      captureFace,
      registerDevice,
      requestDeviceVerification,
      autoCheckImei,
      approveDeviceChange,
      resetFlow,
      saveToGoogleSheet,
    }),
    [state],
  )

  return api
}
