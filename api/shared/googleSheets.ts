import { google } from 'googleapis'

const HARDCODED_SPREADSHEET_ID = '18H7U7yHebMYUkbhrW2hFIpR_M5xI9TnRcC_rU7ktsC4'
const HARDCODED_SHEET_NAME = 'CheckIns'

function normalizePrivateKey(privateKey: string) {
  let normalized = privateKey.trim()

  if (
    (normalized.startsWith('"') && normalized.endsWith('"')) ||
    (normalized.startsWith("'") && normalized.endsWith("'"))
  ) {
    normalized = normalized.slice(1, -1)
  }

  normalized = normalized.replace(/\\n/g, '\n')

  return normalized
}

function parseServiceAccountJson(rawValue: string) {
  try {
    const parsed = JSON.parse(rawValue) as {
      client_email?: string
      private_key?: string
    }
    if (parsed.client_email && parsed.private_key) {
      return parsed
    }
  } catch {
    return null
  }
  return null
}

export function getGoogleSheetConfig() {
  const serviceAccountJson = process.env.GOOGLE_PRIVATE_KEY_JSON ?? process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const parsedServiceAccount = serviceAccountJson ? parseServiceAccountJson(serviceAccountJson) : null

  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ??
    process.env.GOOGLE_SERVICE_ACCOUNT ??
    parsedServiceAccount?.client_email

  const privateKeySource = process.env.GOOGLE_PRIVATE_KEY ?? parsedServiceAccount?.private_key
  const privateKey = privateKeySource ? normalizePrivateKey(privateKeySource) : undefined

  if (!clientEmail || !privateKey) {
    throw new Error(
      'Google Sheets service account is not configured. Required: GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY',
    )
  }

  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('Google private key format is invalid: missing BEGIN PRIVATE KEY / END PRIVATE KEY markers')
  }

  return {
    spreadsheetId: HARDCODED_SPREADSHEET_ID,
    clientEmail,
    privateKey,
    sheetName: HARDCODED_SHEET_NAME,
  }
}

export function createGoogleSheetsClient() {
  const { clientEmail, privateKey } = getGoogleSheetConfig()

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  return google.sheets({ version: 'v4', auth })
}
