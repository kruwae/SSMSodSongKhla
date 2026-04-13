import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { AttendanceRecord } from '../../types/app'
import { getAdminAttendanceRecords } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'Present', value: '—' },
  { label: 'Late', value: '—' },
  { label: 'On leave', value: '—' },
  { label: 'Average hours', value: '—' },
]

export default function AdminAttendancePage(): JSX.Element {
  const attendanceQuery = useQuery({
    queryKey: queryKeys.admin.attendance(),
    queryFn: getAdminAttendanceRecords,
  })

  const records: AttendanceRecord[] = attendanceQuery.data ?? []

  const attendanceStats = attendanceQuery.data
    ? [
        { label: 'Present', value: String(records.filter((record) => record.status === 'present').length) },
        { label: 'Late', value: String(records.filter((record) => record.status === 'late').length) },
        { label: 'On leave', value: String(records.filter((record) => record.status === 'leave').length) },
        {
          label: 'Average hours',
          value:
            records.length > 0
              ? (records.reduce((total, record) => total + (record.workHours ?? 0), 0) / records.length).toFixed(1)
              : '0.0',
        },
      ]
    : fallbackStats

  const isEmpty = !attendanceQuery.isLoading && !attendanceQuery.isError && records.length === 0

  return (
    <div className="space-y-6">
      <SectionCard title="Attendance overview" description="Review presence, late arrivals, and logged hours.">
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
        {attendanceQuery.isLoading ? (
          <EmptyState title="Loading attendance" description="Fetching daily attendance records from Supabase." />
        ) : attendanceQuery.isError ? (
          <EmptyState title="Unable to load attendance" description="Please check the Supabase connection and try again." />
        ) : isEmpty ? (
          <EmptyState title="No attendance records" description="Daily attendance data will appear here once employees start checking in." />
        ) : (
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
        )}
      </SectionCard>
    </div>
  )
}