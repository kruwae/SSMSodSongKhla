import { useState } from 'react'

export type AdminDashboardPageProps = {
  today: string
}

function AdminDashboardPage({ today }: AdminDashboardPageProps) {
  const [testingConnection, setTestingConnection] = useState(false)
  const [testResult, setTestResult] = useState<string>('ยังไม่ได้ทดสอบการเชื่อมต่อ')
  const [testOk, setTestOk] = useState<boolean | null>(null)

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
        setTestOk(false)
        setTestResult(
          `ไม่สามารถเชื่อมต่อ Google Sheets ได้: ${errorMessage}${data.stack ? ` | ${data.stack}` : ''}`,
        )
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
