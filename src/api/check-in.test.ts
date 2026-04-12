import { describe, expect, it, vi } from 'vitest'

type CheckInPayload = {
  requestId: string
  userId: string
  fullName: string
  role: string
  department: string
  deviceId: string
  imei: string
  latitude: number
  longitude: number
  distanceMeters: number
  gpsAccuracy: number
  faceVerified: boolean
  locationVerified: boolean
  deviceVerified: boolean
  status: 'success' | 'rejected'
  reason?: string
  capturedAt: string
}

const makePayload = (overrides: Partial<CheckInPayload> = {}): CheckInPayload => ({
  requestId: 'req-001',
  userId: 'user-001',
  fullName: 'Test User',
  role: 'nurse',
  department: 'ER',
  deviceId: 'device-001',
  imei: '123456789012345',
  latitude: 13.7563,
  longitude: 100.5018,
  distanceMeters: 12,
  gpsAccuracy: 8,
  faceVerified: true,
  locationVerified: true,
  deviceVerified: true,
  status: 'success',
  capturedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

const createRequest = (body: unknown, method = 'POST') =>
  new Request('https://example.test/api/check-in', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

describe('api/check-in', () => {
  it('rejects non-POST requests with a JSON 405 response', async () => {
    const { default: handler } = await import('../../api/check-in')

    const response = await handler(new Request('https://example.test/api/check-in', { method: 'GET' }))

    expect(response.status).toBe(405)
    expect(response.headers.get('Content-Type')).toContain('application/json')
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Method not allowed',
    })
  })

  it('returns a validation error for missing required fields before any sheet call', async () => {
    const { default: handler } = await import('../../api/check-in')

    const response = await handler(
      createRequest({
        ...makePayload(),
        fullName: '   ',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Missing or invalid fullName',
    })
  })

  it('returns a validation error when rejected submissions are missing a reason', async () => {
    const { default: handler } = await import('../../api/check-in')

    const response = await handler(
      createRequest({
        ...makePayload({ status: 'rejected', reason: undefined }),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: 'Missing reason for rejected record',
    })
  })

  it('returns a 500 response when Google Sheets env vars are unavailable', async () => {
    const originalEnv = process.env
    process.env = {}

    try {
      vi.resetModules()
      const { default: handler } = await import('../../api/check-in')

      const response = await handler(createRequest(makePayload()))

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({
        ok: false,
        error: 'Google Sheets environment variables are not configured',
      })
    } finally {
      process.env = originalEnv
      vi.resetModules()
    }
  })
})