import { google } from 'googleapis'

type DiagnosticStepStatus = 'pending' | 'running' | 'success' | 'error'

type DiagnosticStep = {
  name: string
  label: string
  ok: boolean
  status: DiagnosticStepStatus
  message: string
}

type GoogleSheetsConfig = {
  spreadsheetId: string
  clientEmail: string
  privateKey: string
  sheetName: string
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

function getGoogleSheetConfig(): GoogleSheetsConfig {
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

  return { spreadsheetId, clientEmail, privateKey, sheetName }
}

function createGoogleSheetsClient() {
  const { clientEmail, privateKey } = getGoogleSheetConfig()
  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
  return google.sheets({ version: 'v4', auth })
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

const diagnosticStepDefinitions = [
  { name: 'env_check', label: 'ตรวจ env vars' },
  { name: 'credentials_check', label: 'ตรวจ service account credentials' },
  { name: 'auth_check', label: 'ตรวจ auth' },
  { name: 'spreadsheet_access_check', label: 'ตรวจเข้าถึง spreadsheet' },
  { name: 'sheet_tab_check', label: 'ตรวจ tab ที่ต้องใช้' },
] as const

function createStep(
  name: string,
  label: string,
  ok: boolean,
  message: string,
  status: DiagnosticStepStatus = ok ? 'success' : 'error',
): DiagnosticStep {
  return { name, label, ok, status, message }
}

function createPendingSteps(completedSteps: DiagnosticStep[]) {
  return diagnosticStepDefinitions.map(({ name, label }) => {
    const completed = completedSteps.find((step) => step.name === name)
    if (completed) return completed
    return createStep(name, label, false, 'รอการทดสอบ', 'pending')
  })
}

async function testGoogleSheetConnection() {
  const steps: DiagnosticStep[] = []

  try {
    const config = getGoogleSheetConfig()
    steps.push(
      createStep(
        'env_check',
        'ตรวจ env vars',
        true,
        'พบค่า GOOGLE_SHEET_ID และข้อมูล service account แล้ว (รองรับทั้ง GOOGLE_PRIVATE_KEY และ GOOGLE_PRIVATE_KEY_JSON)',
      ),
    )

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
      summary: {
        totalSteps: diagnosticStepDefinitions.length,
        completedSteps: steps.filter((step) => step.ok).length,
        failedStepName: sheetExists ? undefined : 'sheet_tab_check',
      },
      steps: createPendingSteps(steps),
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
      steps.push(createStep('auth_check', 'ตรวจ auth', false, message))
    }

    return {
      ok: false,
      error: friendly,
      summary: {
        totalSteps: diagnosticStepDefinitions.length,
        completedSteps: steps.filter((step) => step.ok).length,
        failedStepName: steps.find((step) => !step.ok)?.name,
      },
      steps: createPendingSteps(steps),
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
    return json(200, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return json(500, { ok: false, error: message })
  }
}
