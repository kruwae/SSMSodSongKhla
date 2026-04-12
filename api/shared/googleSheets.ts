type GoogleSheetsClient = {
  auth: {
    JWT: new (options: { email: string; key: string; scopes: string[] }) => unknown
  }
  sheets: (options: { version: 'v4'; auth: unknown }) => {
    spreadsheets: {
      get: (params: { spreadsheetId: string; includeGridData: boolean }) => Promise<unknown>
      values: {
        append: (params: {
          spreadsheetId: string
          range: string
          valueInputOption: string
          insertDataOption: string
          requestBody: { values: unknown[][] }
        }) => Promise<unknown>
      }
    }
  }
}

declare const google: GoogleSheetsClient

declare const process: {
  env: Record<string, string | undefined>
}

export function getGoogleSheetConfig() {
  const spreadsheetId = process.env.GOOGLE_SHEET_ID ?? process.env.SHEET_ID
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? process.env.GOOGLE_SERVICE_ACCOUNT
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  const sheetName = process.env.GOOGLE_SHEET_TAB || 'CheckIns'

  if (!spreadsheetId || !clientEmail || !privateKey) {
    throw new Error('Google Sheets environment variables are not configured')
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
