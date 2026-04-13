import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { AttendanceRecord } from '../../types/app'

const records: AttendanceRecord[] = [
  { id: '1', employeeName: 'Aree Samran', officeName: 'Head Office', date: '2026-04-12', checkInAt: '08:12', checkOutAt: '17:02', status: 'present', workHours: 8.8 },
  { id: '2', employeeName: 'Nattapong S.', officeName: 'Branch Office', date: '2026-04-12', checkInAt: '08:24', checkOutAt: null, status: 'late', workHours: null },
]

const attendanceStats = [
  { label: 'Present', value: '1' },
  { label: 'Late', value: '1' },
  { label: 'On leave', value: '0' },
  { label: 'Average hours', value: '8.8' },
]

export default function AdminAttendancePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Attendance overview"
        description="Review daily presence, late arrivals, and logged work hours across offices."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {attendanceStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Attendance records"
        description="Daily snapshots for check-in, check-out, and work hour monitoring."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Updated today
          </div>
        }
      >
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/[0.03]">
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                  <th className="py-3.5 pl-4 pr-4 font-semibold">Employee</th>
                  <th className="py-3.5 pr-4 font-semibold">Office</th>
                  <th className="py-3.5 pr-4 font-semibold">Date</th>
                  <th className="py-3.5 pr-4 font-semibold">Status</th>
                  <th className="py-3.5 pr-4 font-semibold">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-slate-950/30">
                {records.map((record) => (
                  <tr key={record.id} className="text-sm transition-colors hover:bg-white/[0.03]">
                    <td className="py-4 pl-4 pr-4">
                      <div>
                        <p className="font-semibold tracking-tight text-white">{record.employeeName}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">
                          In {record.checkInAt}
                          {record.checkOutAt ? ` · Out ${record.checkOutAt}` : ' · Still working'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-300">{record.officeName}</td>
                    <td className="py-4 pr-4 text-slate-300">{record.date}</td>
                    <td className="py-4 pr-4">
                      <StatusBadge
                        variant={record.status === 'present' ? 'success' : record.status === 'late' ? 'warning' : record.status === 'leave' ? 'info' : 'neutral'}
                        label={record.status}
                      />
                    </td>
                    <td className="py-4 pr-4 text-slate-300">{record.workHours ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {records.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No attendance records"
              description="Daily attendance data will appear here once employees start checking in."
            />
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}