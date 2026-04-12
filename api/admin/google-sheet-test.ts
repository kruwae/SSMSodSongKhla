import { createGoogleSheetsClient, getGoogleSheetConfig } from '../shared/googleSheets'

type DiagnosticStep = {
  name: string
  label: string
  ok: boolean
  message: string
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

function createStep(name: string, label: string, ok: boolean, message: string): DiagnosticStep {
  return { name, label, ok, message }
}

async function testGoogleSheetConnection() {
  const steps: DiagnosticStep[] = []

  try {
    const config = getGoogleSheetConfig()
    steps.push(createStep('env_check', 'ตรวจ env vars', true, 'พบค่า SHEET_ID / GOOGLE_SERVICE_ACCOUNT / GOOGLE_PRIVATE_KEY / GOOGLE_SHEET_TAB แล้ว'))

    steps.push(
      createStep(
        'credentials_check',
        'ตรวจ service account credentials',
        true,
        `service account email: ${config.clientEmail}`,
      ),
    )

    const sheets = createGoogleSheetsClient()
    steps.push(createStep('auth_check', 'ตรวจ auth', true, 'สร้าง Google auth client สำเร็จ'))

    const response = (await sheets.spreadsheets.get({
      spreadsheetId: config.spreadsheetId,
      includeGridData: false,
    })) as {
      data: {
        properties?: { title?: string }
        sheets?: Array<{ properties?: { title?: string } }>
      }
    }

    steps.push(
      createStep(
        'spreadsheet_access_check',
        'ตรวจเข้าถึง spreadsheet',
        true,
        `เข้าถึง spreadsheet ได้: ${response.data.properties?.title || 'unknown'}`,
      ),
    )

    const sheetExists = response.data.sheets?.some(
      (sheet: { properties?: { title?: string } }) => sheet.properties?.title === config.sheetName,
    ) ?? false

    steps.push(
      createStep(
        'sheet_tab_check',
        'ตรวจ tab ที่ต้องใช้',
        sheetExists,
        sheetExists
          ? `พบ tab "${config.sheetName}" แล้ว`
          : `ไม่พบ tab "${config.sheetName}" ใน spreadsheet`,
      ),
    )

    return {
      ok: sheetExists,
      spreadsheetTitle: response.data.properties?.title || 'unknown',
      sheetName: config.sheetName,
      sheetExists,
      sheetCount: response.data.sheets?.length ?? 0,
      steps,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    const lower = message.toLowerCase()

    let friendly = message
    if (
      lower.includes('not configured') ||
      lower.includes('environment') ||
      lower.includes('env')
    ) {
      friendly = 'ตรวจ env vars ไม่ผ่าน'
      steps.push(createStep('env_check', 'ตรวจ env vars', false, message))
    } else if (lower.includes('private key') || lower.includes('jwt') || lower.includes('invalid_grant') || lower.includes('unauthorized')) {
      friendly = 'ตรวจ private key format ไม่ผ่าน'
      steps.push(createStep('env_check', 'ตรวจ env vars', true, 'พบค่า env vars แล้ว'))
      steps.push(createStep('credentials_check', 'ตรวจ service account credentials', false, message))
    } else if (lower.includes('permission') || lower.includes('forbidden') || lower.includes('access')) {
      friendly = 'ตรวจสิทธิ์ service account ไม่ผ่าน'
      steps.push(createStep('env_check', 'ตรวจ env vars', true, 'พบค่า env vars แล้ว'))
      steps.push(createStep('credentials_check', 'ตรวจ service account credentials', true, 'สร้าง credential ได้แล้ว'))
      steps.push(createStep('auth_check', 'ตรวจ auth', true, 'auth client ถูกสร้างแล้ว'))
      steps.push(createStep('spreadsheet_access_check', 'ตรวจเข้าถึง spreadsheet', false, message))
    } else if (lower.includes('googleapis') || lower.includes('module not found')) {
      friendly = 'ตรวจ runtime dependency googleapis ไม่ผ่าน'
      steps.push(createStep('env_check', 'ตรวจ env vars', true, 'พบค่า env vars แล้ว'))
      steps.push(createStep('credentials_check', 'ตรวจ service account credentials', true, 'credentials ดูเหมือนถูกต้อง'))
      steps.push(createStep('auth_check', 'ตรวจ auth', false, message))
    } else {
      steps.push(createStep('unknown_error', 'ตรวจสอบไม่ผ่าน', false, message))
    }

    return {
      ok: false,
      error: friendly,
      steps,
      rawError: message,
    }
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
      spreadsheetTitle: result.spreadsheetTitle,
      sheetName: result.sheetName,
      sheetExists: result.sheetExists,
      sheetCount: result.sheetCount,
      steps: result.steps,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return json(500, { ok: false, error: message })
  }
}
