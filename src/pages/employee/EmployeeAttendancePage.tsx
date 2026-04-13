import { useQuery } from '@tanstack/react-query'

import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../features/auth/AuthProvider'
import { getEmployeeAttendanceRecords } from '../../services/supabaseData'

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  present: { label: 'Present', variant: 'success' },
  late: { label: 'Late', variant: 'warning' },
  absent: { label: 'Absent', variant: 'neutral' },
}

export default function EmployeeAttendancePage(): JSX.Element {
  const { session, user } = useAuth()

  const { data } = useQuery({
    queryKey: ['employee-attendance', session?.userId ?? user?.id ?? 'anonymous'],
    queryFn: () => getEmployeeAttendanceRecords(session?.userId ?? user?.id ?? null),
    enabled: Boolean(session?.userId ?? user?.id),
  })

  const rows = data?.rows ?? []
  const summary = data?.summary ?? {
    thisMonth: '—',
    averageHours: '—',
    latestStatus: '—',
    latestCheckIn: '—',
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
              const badge = statusLabels[row.status] ?? statusLabels.absent

              return (
                <article
                  key={row.date}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-white">{row.date}</h3>
                        <StatusBadge label={badge.label} variant={badge.variant} />
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Check-in {row.checkIn} · Check-out {row.checkOut}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-[16rem]">
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Hours
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{row.hours}h</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-semibold capitalize text-slate-100">{row.status}</p>
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