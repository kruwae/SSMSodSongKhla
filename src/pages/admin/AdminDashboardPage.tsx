import { useState } from 'react'

export type AdminDashboardPageProps = {
  today: string
}

type GoogleSheetTestStepStatus = 'pending' | 'running' | 'success' | 'error'

type GoogleSheetTestStep = {
  name: string
  label: string
  ok: boolean
  status: GoogleSheetTestStepStatus
  message: string
}

type GoogleSheetTestResponse = {
  ok: boolean
  message?: string
  spreadsheetTitle?: string
  sheetName?: string
  sheetExists?: boolean
  sheetCount?: number
  error?: string
  rawError?: string
  stack?: string
  summary?: {
    totalSteps: number
    completedSteps: number
    failedStepName?: string
  }
  steps?: GoogleSheetTestStep[]
}

function AdminDashboardPage({ today }: AdminDashboardPageProps) {
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState('ยังไม่ได้ทดสอบการเชื่อมต่อ')
  const [testOk, setTestOk] = useState<boolean | null>(null)
  const [testSteps, setTestSteps] = useState<GoogleSheetTestStep[]>([
    { name: 'env_check', label: 'ตรวจ env vars', ok: false, status: 'pending', message: 'รอการทดสอบ' },
    { name: 'credentials_check', label: 'ตรวจ service account credentials', ok: false, status: 'pending', message: 'รอการทดสอบ' },
    { name: 'auth_check', label: 'ตรวจ auth', ok: false, status: 'pending', message: 'รอการทดสอบ' },
    { name: 'spreadsheet_access_check', label: 'ตรวจเข้าถึง spreadsheet', ok: false, status: 'pending', message: 'รอการทดสอบ' },
    { name: 'sheet_tab_check', label: 'ตรวจ tab ที่ต้องใช้', ok: false, status: 'pending', message: 'รอการทดสอบ' },
  ])

  const classifyGoogleSheetError = (message: string) => {
    const lower = message.toLowerCase()
    if (
      lower.includes('not configured') ||
      lower.includes('process is not defined') ||
      lower.includes('env') ||
      lower.includes('environment')
    ) {
      return 'ปัญหา env var: ตรวจสอบค่า SHEET_ID, GOOGLE_SERVICE_ACCOUNT, GOOGLE_PRIVATE_KEY และ GOOGLE_SHEET_TAB'
    }
    if (lower.includes('private key') || lower.includes('jwt') || lower.includes('invalid_grant') || lower.includes('unauthorized')) {
      return 'ปัญหา private key format: ตรวจสอบว่า GOOGLE_PRIVATE_KEY มีคีย์ครบและ newline ถูกต้องเป็น \\n'
    }
    if (lower.includes('permission') || lower.includes('forbidden') || lower.includes('access')) {
      return 'ปัญหาสิทธิ์ service account: ตรวจสอบว่าชีตถูกแชร์ให้ service account แล้ว และมีสิทธิ์เข้าถึง'
    }
    if (lower.includes('googleapis') || lower.includes('module not found')) {
      return 'ปัญหา googleapis runtime dependency: ตรวจสอบว่าได้ติดตั้ง googleapis และ deploy ใหม่แล้ว'
    }
    return `สาเหตุไม่ชัดเจน: ${message}`
  }

  const renderStepStatusLabel = (status: GoogleSheetTestStepStatus) =>
    status === 'success' ? 'ผ่าน' : status === 'error' ? 'ไม่ผ่าน' : status === 'running' ? 'กำลังตรวจ' : 'รอ'

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult('กำลังทดสอบการเชื่อมต่อ Google Sheets...')
    setTestOk(null)
    setTestSteps((current) =>
      current.map((step, index) => ({
        ...step,
        ok: false,
        status: index === 0 ? 'running' : 'pending',
        message: index === 0 ? 'กำลังเริ่มการทดสอบ' : 'รอการทดสอบ',
      })),
    )

    try {
      const response = await fetch('/api/admin/google-sheet-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const rawText = await response.text()
      const data = rawText ? (JSON.parse(rawText) as GoogleSheetTestResponse) : null

      if (data?.steps?.length) {
        setTestSteps(data.steps)
      }

      if (!response.ok || !data?.ok) {
        const errorMessage = data?.error || data?.message || rawText || `HTTP ${response.status}`
        const classifiedError = classifyGoogleSheetError(errorMessage)
        setTestOk(false)
        setTestResult(`ไม่สามารถเชื่อมต่อ Google Sheets ได้: ${classifiedError}`)

        if (!data?.steps?.length) {
          setTestSteps((current) =>
            current.map((step, index) => ({
              ...step,
              ok: false,
              status: index === 0 ? 'error' : 'pending',
              message: index === 0 ? errorMessage : 'รอการทดสอบ',
            })),
          )
        }
        return
      }

      setTestOk(true)
      setTestResult(
        `เชื่อมต่อสำเร็จ: ${data.spreadsheetTitle || '-'} | tab: ${data.sheetName || '-'} | พบแท็บ: ${data.sheetExists ? 'ใช่' : 'ไม่พบ'} | จำนวนแท็บ: ${data.sheetCount ?? 0}`,
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถทดสอบการเชื่อมต่อได้'
      setTestOk(false)
      setTestResult(`ไม่สามารถทดสอบการเชื่อมต่อได้: ${errorMessage}`)
      setTestSteps((current) =>
        current.map((step, index) => ({
          ...step,
          ok: false,
          status: index === 0 ? 'error' : 'pending',
          message: index === 0 ? errorMessage : 'รอการทดสอบ',
        })),
      )
    } finally {
      setTestingConnection(false)
    }
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h2>แดชบอร์ดผู้ดูแลระบบ</h2>
        </div>
        <div className="topbar-meta">
          <span>{today}</span>
        </div>
      </header>

      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Summary</p>
            <h3>ภาพรวมระบบ</h3>
          </div>
        </div>

        <div className="summary-grid">
          <div>
            <span>อุปกรณ์รออนุมัติ</span>
            <strong>14 รายการ</strong>
          </div>
          <div>
            <span>ผู้ใช้งานทั้งหมด</span>
            <strong>128 คน</strong>
          </div>
          <div>
            <span>จุดลงเวลา</span>
            <strong>7 จุด</strong>
          </div>
        </div>
      </section>

      <section className="panel summary-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Diagnostics</p>
            <h3>ทดสอบการเชื่อมต่อ Google Sheets</h3>
          </div>
        </div>

        <div className="panel-actions">
          <button type="button" className="primary-button" onClick={handleTestConnection} disabled={testingConnection}>
            {testingConnection ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}
          </button>
        </div>

        <p className={`helper-text ${testOk === false ? 'error-text' : testOk === true ? 'success-text' : ''}`}>
          {testResult}
        </p>

        <div className="diagnostic-progress">
          <div className="diagnostic-progress__meta">
            <strong>ความคืบหน้า</strong>
            <span>
              ผ่าน {testSteps.filter((step) => step.status === 'success').length} / {testSteps.length} ขั้นตอน
            </span>
          </div>

          <div className="diagnostic-steps">
            {testSteps.map((step, index) => (
              <div key={step.name} className={`diagnostic-step diagnostic-step--${step.status}`}>
                <div className="diagnostic-step__index">{index + 1}</div>
                <div className="diagnostic-step__content">
                  <div className="diagnostic-step__header">
                    <strong>{step.label}</strong>
                    <span className={`status-pill status-${step.status === 'success' ? 'active' : step.status === 'error' ? 'error' : step.status === 'running' ? 'starting' : 'idle'}`}>
                      {renderStepStatusLabel(step.status)}
                    </span>
                  </div>
                  <p>{step.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default AdminDashboardPage
