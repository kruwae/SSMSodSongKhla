import { google } from 'googleapis'

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
  const spreadsheetId = process.env.GOOGLE_SHEET_ID ?? process.env.SHEET_ID
  const serviceAccountJson = process.env.GOOGLE_PRIVATE_KEY_JSON ?? process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const parsedServiceAccount = serviceAccountJson ? parseServiceAccountJson(serviceAccountJson) : null

  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ??
    process.env.GOOGLE_SERVICE_ACCOUNT ??
    parsedServiceAccount?.client_email

  const privateKeySource = process.env.GOOGLE_PRIVATE_KEY ?? parsedServiceAccount?.private_key
  const privateKey = privateKeySource ? normalizePrivateKey(privateKeySource) : undefined

  const sheetName = process.env.GOOGLE_SHEET_TAB || 'CheckIns'

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error(
      'Google Sheets environment variables are not configured. Required: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY or GOOGLE_PRIVATE_KEY_JSON',
    )
  }

  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error('Google private key format is invalid: missing BEGIN PRIVATE KEY / END PRIVATE KEY markers')
  }

  return {
    spreadsheetId,
    clientEmail,
    privateKey,
    sheetName,
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
