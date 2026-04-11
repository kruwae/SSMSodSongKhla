import './App.css'

function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">SSM Attendance</p>
        <h1>หน้าเริ่มต้นพร้อมใช้งาน</h1>
        <p className="hero-copy">
          ระบบกำลังทำงานแล้ว ตอนนี้คุณสามารถแก้ไขไฟล์ <code>src/App.tsx</code> 
          แล้วบันทึกเพื่อทดสอบ HMR ได้ทันที
        </p>

        <div className="hero-actions">
          <a className="primary-button" href="https://react.dev/" target="_blank" rel="noreferrer">
            React Docs
          </a>
          <button type="button" className="secondary-button">
            Ready
          </button>
        </div>
      </section>
    </main>
  )
}

export default App
