import { createGoogleSheetsClient, getGoogleSheetConfig } from '../shared/googleSheets'

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

async function testGoogleSheetConnection() {
  const { spreadsheetId, sheetName } = getGoogleSheetConfig()
  const sheets = createGoogleSheetsClient()
  const response = await sheets.spreadsheets.get({
    spreadsheetId,
    includeGridData: false,
  })

  const sheetExists = response.data.sheets?.some(
    (sheet: { properties?: { title?: string } }) => sheet.properties?.title === sheetName,
  ) ?? false

  return {
    spreadsheetTitle: response.data.properties?.title || 'unknown',
    sheetName,
    sheetExists,
    sheetCount: response.data.sheets?.length ?? 0,
  }
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return json(405, { ok: false, error: 'Method not allowed' })
  }

  try {
    const result = await testGoogleSheetConnection()
    return json(200, {
      ok: true,
      message: 'Google Sheets connection is working',
      ...result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const stack = error instanceof Error ? error.stack : undefined
    return json(500, { ok: false, error: message, stack })
  }
}
