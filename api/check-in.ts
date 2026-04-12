import { createGoogleSheetsClient, getGoogleSheetConfig } from './shared/googleSheets'


type CheckInRequest = {
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

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function validatePayload(payload: unknown): { ok: true; data: CheckInRequest } | { ok: false; error: string } {
  if (!payload || typeof payload !== 'object') return { ok: false, error: 'Invalid JSON payload' }
  const data = payload as Partial<CheckInRequest>
  const requiredStrings: Array<[keyof CheckInRequest, string]> = [
    ['requestId', 'requestId'],
    ['userId', 'userId'],
    ['fullName', 'fullName'],
    ['role', 'role'],
    ['department', 'department'],
    ['deviceId', 'deviceId'],
    ['imei', 'imei'],
    ['capturedAt', 'capturedAt'],
  ]
  for (const [key, label] of requiredStrings) {
    if (!isNonEmptyString(data[key])) return { ok: false, error: `Missing or invalid ${label}` }
  }
  const numericFields: Array<[keyof CheckInRequest, string]> = [
    ['latitude', 'latitude'],
    ['longitude', 'longitude'],
    ['distanceMeters', 'distanceMeters'],
    ['gpsAccuracy', 'gpsAccuracy'],
  ]
  for (const [key, label] of numericFields) {
    if (!isFiniteNumber(data[key])) return { ok: false, error: `Missing or invalid ${label}` }
  }
  const booleanFields: Array<[keyof CheckInRequest, string]> = [
    ['faceVerified', 'faceVerified'],
    ['locationVerified', 'locationVerified'],
    ['deviceVerified', 'deviceVerified'],
  ]
  for (const [key, label] of booleanFields) {
    if (typeof data[key] !== 'boolean') return { ok: false, error: `Missing or invalid ${label}` }
  }
  if (data.status !== 'success' && data.status !== 'rejected') return { ok: false, error: 'Invalid status' }
  if (data.status === 'rejected' && !isNonEmptyString(data.reason)) return { ok: false, error: 'Missing reason for rejected record' }
  return { ok: true, data: data as CheckInRequest }
}

async function appendToSheet(row: CheckInRequest) {
  const { spreadsheetId, sheetName } = getGoogleSheetConfig()
  const sheets = createGoogleSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: [[
        row.capturedAt,
        row.requestId,
        row.userId,
        row.fullName,
        row.role,
        row.department,
        row.deviceId,
        row.imei,
        row.latitude,
        row.longitude,
        row.distanceMeters,
        row.gpsAccuracy,
        row.faceVerified,
        row.locationVerified,
        row.deviceVerified,
        row.status,
        row.reason || '',
      ]],
    },
  })
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' })
  }

  try {
    const payload = await request.json()
    const validated = validatePayload(payload)
    if (validated.ok === false) {
      return json(400, { ok: false, error: validated.error })
    }

    await appendToSheet(validated.data)
    return json(200, { ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return json(500, { ok: false, error: message })
  }
}
