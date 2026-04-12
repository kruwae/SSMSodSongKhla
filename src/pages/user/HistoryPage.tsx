type AttendanceRow = {
  name: string
  status: string
  time: string
  department: string
}

export type HistoryPageProps = {
  checkedIn: number
  attendanceRows: AttendanceRow[]
}

function HistoryPage({ checkedIn, attendanceRows }: HistoryPageProps) {
  return (
    <article className="panel records-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Today Records</p>
          <h3>รายการลงเวลาล่าสุด</h3>
        </div>
        <span className="mini-chip">ลงแล้ว {checkedIn} คน</span>
      </div>

      <div className="table-wrap">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>ชื่อ</th>
              <th>แผนก</th>
              <th>เวลา</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRows.map((row) => (
              <tr key={`${row.name}-${row.time}`}>
                <td>{row.name}</td>
                <td>{row.department}</td>
                <td>{row.time}</td>
                <td>
                  <span className={`status-pill status-${row.status}`}>{row.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}

export default HistoryPage