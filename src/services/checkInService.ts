export type SignInStep = 'idle' | 'face' | 'location' | 'deviceCode' | 'submitting' | 'success' | 'error'

export type CameraStatus = 'idle' | 'starting' | 'active' | 'error'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export type GpsPrecision = '12-digit' | '6-digit'

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

export type CheckInSnapshot = {
  timestamp: string
  deviceId: string
  imei: string
  imeiChecked: boolean
  faceVerified: boolean
  locationVerified: boolean
  adminApprovalGranted: boolean
  gpsMessage: string
  distanceMeters: number | null
  serviceUnit: string
}

export type CheckInServiceDeps = {
  schoolLat: number
  schoolLng: number
  maxDistanceMeters: number
  minAccuracyMeters: number
  getTargetLocation?: () => { lat: number; lng: number } | null
  storedDeviceSeed: {
    imei: string
    name: string
    owner: string
    serviceUnit: string
    gpsEnabled: boolean
    scanEnabled: boolean
  }
}

export const DEFAULT_SCHOOL_LAT = 6.56405379821
export const DEFAULT_SCHOOL_LNG = 101.38833639069
export const DEFAULT_MAX_DISTANCE_METERS = 70
export const DEFAULT_MIN_ACCURACY_METERS = 100

export const DEFAULT_STORED_DEVICE_SEED = {
  imei: '123456',
  name: 'มือถือเจ้าหน้าที่เวรเช้า',
  owner: 'สุภาวดี แสงทอง',
  serviceUnit: 'หน่วยบริการ A',
  gpsEnabled: true,
  scanEnabled: true,
}

export function haversineMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function captureDeviceFingerprint(seed: CheckInServiceDeps['storedDeviceSeed']) {
  return {
    imei: seed.imei,
    name: seed.name,
    owner: seed.owner,
    serviceUnit: seed.serviceUnit,
    gpsEnabled: seed.gpsEnabled,
    scanEnabled: seed.scanEnabled,
  }
}

export function createCheckInService(deps: CheckInServiceDeps) {
  return {
    captureDeviceFingerprint: () => captureDeviceFingerprint(deps.storedDeviceSeed),
    buildSavePayload: (snapshot: Omit<CheckInSnapshot, 'timestamp'>) => ({
      timestamp: new Date().toISOString(),
      ...snapshot,
    }),
    resolveGpsResult: (position: GeolocationPosition) => {
      const lat = position.coords.latitude
      const lng = position.coords.longitude
      const accuracy = position.coords.accuracy
      const targetLocation = deps.getTargetLocation?.() ?? {
        lat: deps.schoolLat,
        lng: deps.schoolLng,
      }
      const meters = haversineMeters(lat, lng, targetLocation.lat, targetLocation.lng)
      const precision: GpsPrecision = accuracy <= 10 ? '12-digit' : '6-digit'

      if (accuracy > deps.minAccuracyMeters) {
        return {
          lat,
          lng,
          accuracy,
          meters,
          precision,
          ok: false,
          message: `พิกัดยังไม่นิ่งพอ (accuracy ${accuracy.toFixed(1)}m) | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`,
          step: 'error' as const,
          cameraMessage: 'ตรวจ GPS ไม่ผ่าน: ความแม่นยำของพิกัดยังไม่พอ',
        }
      }

      if (meters <= deps.maxDistanceMeters) {
        return {
          lat,
          lng,
          accuracy,
          meters,
          precision,
          ok: true,
          message: `ผ่าน GPS: อยู่ห่าง ${meters.toFixed(1)} เมตร | accuracy ${accuracy.toFixed(1)}m | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`,
          step: 'deviceCode' as const,
          cameraMessage: 'ผ่าน GPS แล้ว กรุณากรอกรหัสโทรศัพท์/รหัสเครื่องที่ลงทะเบียน',
        }
      }

      return {
        lat,
        lng,
        accuracy,
        meters,
        precision,
        ok: false,
        message: `ไม่ผ่าน GPS: อยู่ห่าง ${meters.toFixed(1)} เมตร เกิน ${deps.maxDistanceMeters} เมตร | accuracy ${accuracy.toFixed(1)}m | พิกัด ${lat.toFixed(12)}, ${lng.toFixed(12)}`,
        step: 'error' as const,
        cameraMessage: 'ตรวจ GPS ไม่ผ่าน: พิกัดอยู่นอกพื้นที่กำหนด',
      }
    },
    resolveGpsError: (error: GeolocationPositionError) => {
      const reason =
        error.code === error.PERMISSION_DENIED
          ? 'ไม่ได้อนุญาตให้เข้าถึงตำแหน่ง'
          : error.code === error.POSITION_UNAVAILABLE
            ? 'ไม่สามารถระบุตำแหน่งได้'
            : error.code === error.TIMEOUT
              ? 'หมดเวลารอข้อมูลตำแหน่ง'
              : error.message || 'ไม่สามารถดึงตำแหน่งได้'

      return {
        ok: false,
        message: `ตรวจ GPS ไม่ผ่าน: ${reason}`,
        cameraMessage: `ตรวจ GPS ไม่ผ่าน: ${reason}`,
      }
    },
    buildDeviceMismatchMessage: (device: RegisteredDevice) =>
      `อุปกรณ์ไม่ตรงกับที่ลงทะเบียนไว้ | หน่วยบริการเดิม: ${device.serviceUnit} | รอแอดมินยืนยัน`,
  }
}

export function buildDeviceMismatchMessage(device: RegisteredDevice) {
  return `อุปกรณ์ไม่ตรงกับที่ลงทะเบียนไว้ | หน่วยบริการเดิม: ${device.serviceUnit} | รอแอดมินยืนยัน`
}
