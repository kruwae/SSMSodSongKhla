import { describe, expect, it } from 'vitest'
import {
  buildDeviceMismatchMessage,
  captureDeviceFingerprint,
  createCheckInService,
  DEFAULT_MAX_DISTANCE_METERS,
  DEFAULT_MIN_ACCURACY_METERS,
  DEFAULT_SCHOOL_LAT,
  DEFAULT_SCHOOL_LNG,
  DEFAULT_STORED_DEVICE_SEED,
  haversineMeters,
} from './checkInService'

describe('checkInService', () => {
  it('captures the default device fingerprint', () => {
    expect(captureDeviceFingerprint(DEFAULT_STORED_DEVICE_SEED)).toEqual({
      imei: '123456',
      name: 'มือถือเจ้าหน้าที่เวรเช้า',
      owner: 'สุภาวดี แสงทอง',
      serviceUnit: 'หน่วยบริการ A',
      gpsEnabled: true,
      scanEnabled: true,
    })
  })

  it('calculates distance and accepts a nearby position', () => {
    const service = createCheckInService({
      schoolLat: DEFAULT_SCHOOL_LAT,
      schoolLng: DEFAULT_SCHOOL_LNG,
      maxDistanceMeters: DEFAULT_MAX_DISTANCE_METERS,
      minAccuracyMeters: DEFAULT_MIN_ACCURACY_METERS,
      storedDeviceSeed: DEFAULT_STORED_DEVICE_SEED,
    })

    const result = service.resolveGpsResult({
      coords: {
        latitude: DEFAULT_SCHOOL_LAT,
        longitude: DEFAULT_SCHOOL_LNG,
        accuracy: 8,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: 0,
    })

    expect(result.ok).toBe(true)
    expect(result.step).toBe('deviceCode')
    expect(result.meters).toBeCloseTo(0, 1)
    expect(result.cameraMessage).toContain('ผ่าน GPS แล้ว')
  })

  it('builds a mismatch message for a registered device', () => {
    expect(
      buildDeviceMismatchMessage({
        id: 'DEV-1',
        imei: '111',
        name: 'device',
        owner: 'owner',
        serviceUnit: 'หน่วยบริการ B',
        gpsEnabled: true,
        scanEnabled: true,
        approved: true,
      }),
    ).toContain('หน่วยบริการเดิม: หน่วยบริการ B')
  })

  it('calculates haversine distance', () => {
    expect(haversineMeters(0, 0, 0, 1)).toBeGreaterThan(100000)
  })
})