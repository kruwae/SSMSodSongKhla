import { google } from 'googleapis'

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

  const privateKey =
    (process.env.GOOGLE_PRIVATE_KEY ?? parsedServiceAccount?.private_key)?.replace(/\\n/g, '\n')

  const sheetName = process.env.GOOGLE_SHEET_TAB || 'CheckIns'

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error(
      'Google Sheets environment variables are not configured. Required: GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY or GOOGLE_PRIVATE_KEY_JSON',
    )
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
