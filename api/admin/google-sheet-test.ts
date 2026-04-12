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


function buildEnvVarChecklist(values: {
  spreadsheetId?: string
  clientEmail?: string
  privateKey?: string
  sheetName?: string
}) {
  const checks = [
    ['GOOGLE_SHEET_ID', Boolean(values.spreadsheetId)],
    ['GOOGLE_SERVICE_ACCOUNT_EMAIL', Boolean(values.clientEmail)],
    ['GOOGLE_PRIVATE_KEY', Boolean(values.privateKey)],
    ['GOOGLE_SHEET_TAB', Boolean(values.sheetName)],
  ] as const

  return checks.map(([label, ok]) => `${ok ? '/' : 'X'} ${label}`).join(' | ')
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
  const serviceAccountJson = process.env.GOOGLE_PRIVATE_KEY_JSON ?? process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  const parsedServiceAccount = serviceAccountJson ? parseServiceAccountJson(serviceAccountJson) : null

  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ??
    process.env.GOOGLE_SERVICE_ACCOUNT ??
    parsedServiceAccount?.client_email

  const privateKeySource = process.env.GOOGLE_PRIVATE_KEY ?? parsedServiceAccount?.private_key
  const privateKey = privateKeySource ? normalizePrivateKey(privateKeySource) : undefined
  const spreadsheetId = '18H7U7yHebMYUkbhrW2hFIpR_M5xI9TnRcC_rU7ktsC4'
  const sheetName = 'CheckIns'
  const envChecklist = buildEnvVarChecklist({
    spreadsheetId,
    clientEmail,
    privateKey,
    sheetName,
  })

  if (!clientEmail || !privateKey) {
    throw new Error(
      `Google Sheets service account is not configured. ${envChecklist}. Required: GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY`,
    )
  }

  if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
    throw new Error(`Google private key format is invalid: missing BEGIN PRIVATE KEY / END PRIVATE KEY markers. ${envChecklist}`)
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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
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
        buildEnvVarChecklist({
          spreadsheetId: config.spreadsheetId,
          clientEmail: config.clientEmail,
          privateKey: config.privateKey,
          sheetName: config.sheetName,
        }),
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

    const response = (await withTimeout(
      sheets.spreadsheets.get({
        spreadsheetId: config.spreadsheetId,
        includeGridData: false,
      }),
      8000,
      'Google Sheets request timeout: ใช้เวลานานเกิน 8 วินาที',
    )) as {
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
    } else if (
      lower.includes('private key') ||
      lower.includes('jwt') ||
      lower.includes('invalid_grant') ||
      lower.includes('unauthorized') ||
      lower.includes('pem routines') ||
      lower.includes('no start line')
    ) {
      friendly = 'ตรวจ private key format ไม่ผ่าน'
      steps.push(createStep('env_check', 'ตรวจ env vars', true, 'พบค่า env vars แล้ว'))
      steps.push(
        createStep(
          'credentials_check',
          'ตรวจ service account credentials',
          false,
          `${message} — ตรวจสอบว่า GOOGLE_PRIVATE_KEY ใช้ \\n คั่นบรรทัด และระบบแปลงด้วย .replace(/\\\\n/g, "\\n") ถูกต้อง`,
        ),
      )
    } else if (lower.includes('timeout') || lower.includes('timed out')) {
      friendly = 'การเชื่อมต่อ Google Sheets หมดเวลา'
      steps.push(createStep('env_check', 'ตรวจ env vars', true, 'พบค่า env vars แล้ว'))
      steps.push(createStep('credentials_check', 'ตรวจ service account credentials', true, 'สร้าง credential ได้แล้ว'))
      steps.push(createStep('auth_check', 'ตรวจ auth', true, 'auth client ถูกสร้างแล้ว'))
      steps.push(createStep('spreadsheet_access_check', 'ตรวจเข้าถึง spreadsheet', false, message))
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
