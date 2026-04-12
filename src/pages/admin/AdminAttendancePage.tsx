import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { AttendanceRecord } from '../../types/app'

const records: AttendanceRecord[] = [
  { id: '1', employeeName: 'Aree Samran', officeName: 'Head Office', date: '2026-04-12', checkInAt: '08:12', checkOutAt: '17:02', status: 'present', workHours: 8.8 },
  { id: '2', employeeName: 'Nattapong S.', officeName: 'Branch Office', date: '2026-04-12', checkInAt: '08:24', checkOutAt: null, status: 'late', workHours: null },
]

export default function AdminAttendancePage(): JSX.Element {
  return (
    <SectionCard title="Attendance records" description="Review daily presence, late arrivals, and work hours.">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="text-left text-sm text-slate-500">
              <th className="py-3 pr-4 font-medium">Employee</th>
              <th className="py-3 pr-4 font-medium">Office</th>
              <th className="py-3 pr-4 font-medium">Date</th>
              <th className="py-3 pr-4 font-medium">Status</th>
              <th className="py-3 pr-4 font-medium">Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record.id} className="text-sm">
                <td className="py-3 pr-4 font-medium text-slate-900">{record.employeeName}</td>
                <td className="py-3 pr-4 text-slate-600">{record.officeName}</td>
                <td className="py-3 pr-4 text-slate-600">{record.date}</td>
                <td className="py-3 pr-4">
                  <StatusBadge
                    status={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : record.status === 'leave' ? 'info' : 'neutral'}
                    label={record.status}
                  />
                </td>
                <td className="py-3 pr-4 text-slate-600">{record.workHours ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {records.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No attendance records" description="Daily attendance data will appear here once employees start checking in." />
        </div>
      ) : null}
    </SectionCard>
  )
}