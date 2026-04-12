import { useState } from 'react'

export type AdminDashboardPageProps = {
  today: string
}

function AdminDashboardPage({ today }: AdminDashboardPageProps) {
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<string>('ยังไม่ได้ทดสอบการเชื่อมต่อ')
  const [testOk, setTestOk] = useState<boolean | null>(null)

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

  const handleTestConnection = async () => {
    setTestingConnection(true)
    setTestResult('กำลังทดสอบการเชื่อมต่อ Google Sheets...')
    setTestOk(null)

    try {
      const response = await fetch('/api/admin/google-sheet-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = (await response.json()) as {
        ok: boolean
        message?: string
        spreadsheetTitle?: string
        sheetName?: string
        sheetExists?: boolean
        sheetCount?: number
        error?: string
        stack?: string
      }

      if (!response.ok || !data.ok) {
        const errorMessage = data.error || `HTTP ${response.status}`
        const classifiedError = classifyGoogleSheetError(errorMessage)
        setTestOk(false)
        setTestResult(`ไม่สามารถเชื่อมต่อ Google Sheets ได้: ${classifiedError}`)
        return
      }

      setTestOk(true)
      setTestResult(
        `เชื่อมต่อสำเร็จ: ${data.spreadsheetTitle} | tab: ${data.sheetName} | พบแท็บ: ${data.sheetExists ? 'ใช่' : 'ไม่พบ'} | จำนวนแท็บ: ${data.sheetCount ?? 0}`,
      )
    } catch {
      setTestOk(false)
      setTestResult('ไม่สามารถทดสอบการเชื่อมต่อได้')
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
      </section>
    </div>
  )
}

export default AdminDashboardPage
