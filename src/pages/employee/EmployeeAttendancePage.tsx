import { useQuery } from '@tanstack/react-query'

import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../features/auth/AuthProvider'
import { getEmployeeAttendanceRecords, type AttendanceSummary } from '../../services/supabaseData'

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  present: { label: 'Present', variant: 'success' },
  late: { label: 'Late', variant: 'warning' },
  absent: { label: 'Absent', variant: 'neutral' },
}

type EmployeeAttendanceData = Awaited<ReturnType<typeof getEmployeeAttendanceRecords>>['data']

function formatStatus(row: AttendanceSummary): { label: string; variant: 'success' | 'warning' | 'neutral' } {
  if (row.lateStatus) return statusLabels.late
  if (row.checkOutAt) return statusLabels.present
  return statusLabels.absent
}

function formatHours(value: AttendanceSummary['workHours']): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value.toFixed(1)}h`
  }
  return '—'
}

export default function EmployeeAttendancePage(): JSX.Element {
  const { session, user } = useAuth()
  const profileId = session?.userId ?? user?.id ?? null

  const { data } = useQuery({
    queryKey: ['employee-attendance', profileId ?? 'anonymous'],
    queryFn: () => getEmployeeAttendanceRecords(profileId),
    enabled: Boolean(profileId),
  })

  const rows: EmployeeAttendanceData = data?.data ?? []
  const summary = {
    thisMonth: rows.length > 0 ? `${rows.length}` : '—',
    averageHours:
      rows.length > 0
        ? `${(rows.reduce((total, row) => total + (typeof row.workHours === 'number' ? row.workHours : 0), 0) / rows.length).toFixed(1)}h`
        : '—',
    latestStatus: rows[0] ? (rows[0].lateStatus ? 'Late' : rows[0].checkOutAt ? 'Present' : 'In progress') : '—',
    latestCheckIn: rows[0]?.checkInAt ?? '—',
  }

  return (
    <div className="space-y-5">
      <SectionCard
        title="My attendance"
        description="Track your attendance history, hours worked, and daily check-in activity."
        className="overflow-hidden"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">This month</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{summary.thisMonth}</p>
            <p className="mt-1 text-sm text-slate-400">Completed on schedule</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Average hours</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{summary.averageHours}</p>
            <p className="mt-1 text-sm text-slate-400">Per working day</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Latest status</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{summary.latestStatus}</p>
            <p className="mt-1 text-sm text-slate-400">Checked in {summary.latestCheckIn}</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Recent records"
        description="Review your latest attendance entries and total hours."
        actions={
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
            Updated today
          </div>
        }
      >
        {rows.length > 0 ? (
          <div className="space-y-3">
            {rows.map((row) => {
              const badge = formatStatus(row)

              return (
                <article
                  key={row.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-white">
                          {row.checkInAt.split('T')[0]}
                        </h3>
                        <StatusBadge label={badge.label} variant={badge.variant} />
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Check-in {row.checkInAt} · Check-out {row.checkOutAt ?? '—'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-[16rem]">
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Hours
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{formatHours(row.workHours)}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-semibold capitalize text-slate-100">
                          {row.lateStatus ? 'Late' : row.checkOutAt ? 'Present' : 'In progress'}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No attendance data"
            description="Your attendance history will appear here once check-ins are recorded."
          />
        )}
      </SectionCard>
    </div>
  )
}