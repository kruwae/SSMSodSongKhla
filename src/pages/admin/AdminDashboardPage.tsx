import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminDashboardSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackMetrics = [
  {
    label: 'Today check-ins',
    value: '—',
    trend: 'Live data unavailable',
    note: 'Waiting for attendance records',
  },
  {
    label: 'On time',
    value: '—',
    trend: 'Live data unavailable',
    note: 'Waiting for attendance records',
  },
  {
    label: 'Leave requests',
    value: '—',
    trend: 'Live data unavailable',
    note: 'Waiting for leave requests',
  },
  {
    label: 'Active devices',
    value: '—',
    trend: 'Live data unavailable',
    note: 'Waiting for device records',
  },
]

export default function AdminDashboardPage(): JSX.Element {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.admin.dashboard(),
    queryFn: getAdminDashboardSummary,
  })

  const summary = dashboardQuery.data

  const metrics = summary
    ? [
        {
          label: 'Today check-ins',
          value: String(summary.todayCheckIns),
          trend: summary.todayCheckInsChange,
          note: 'vs yesterday',
        },
        {
          label: 'On time',
          value: String(summary.onTimeCount),
          trend: summary.onTimeChange,
          note: summary.attendanceNote,
        },
        {
          label: 'Leave requests',
          value: String(summary.pendingLeaveRequests),
          trend: summary.leaveTrend,
          note: summary.leaveNote,
        },
        {
          label: 'Active devices',
          value: String(summary.activeDevices),
          trend: summary.deviceTrend,
          note: summary.deviceNote,
        },
      ]
    : fallbackMetrics

  const recentActivity = summary?.recentActivity ?? []
  const upcomingTasks = summary?.upcomingTasks ?? []

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-amber-300/20 bg-gradient-to-br from-[#17182f] via-[#11172b] to-[#0b1020] p-6 shadow-[0_24px_80px_rgba(3,7,18,0.55)] sm:p-7">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_36%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center rounded-full border border-amber-300/25 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.06)]">
              Admin overview
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">Attendance dashboard</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                Track check-ins, approvals, and device health from one polished workspace built for daily attendance operations.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Shifts live</p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary?.shiftsLive ?? '—'}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Approval queue</p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary?.approvalQueue ?? '—'}</p>
            </div>
            <div className="rounded-2xl border border-sky-400/20 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Device health</p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary?.deviceHealth ?? '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {dashboardQuery.isLoading ? (
        <SectionCard title="Loading dashboard data" description="Fetching live attendance metrics from Supabase.">
          <EmptyState title="Loading dashboard" description="Please wait while the latest admin overview loads." />
        </SectionCard>
      ) : null}

      {dashboardQuery.isError ? (
        <SectionCard title="Dashboard unavailable" description="There was a problem loading live metrics from Supabase.">
          <EmptyState title="Unable to load dashboard" description="Please try again later or check your Supabase connection." />
        </SectionCard>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <SectionCard
            key={metric.label}
            className="h-full border border-white/10 bg-[#10172a]/90 shadow-[0_18px_40px_rgba(3,7,18,0.35)] backdrop-blur"
            title={metric.label}
          >
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <p className="text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
                <StatusBadge
                  variant={metric.trend.toLowerCase().includes('needs') || metric.trend.toLowerCase().includes('pending') ? 'warning' : 'success'}
                  label={metric.trend}
                />
              </div>
              <p className="text-sm text-slate-400">{metric.note}</p>
            </div>
          </SectionCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <SectionCard
          title="Operational summary"
          description="A quick snapshot of attendance momentum, pending work, and device status."
          className="border border-white/10 bg-[#10172a]/90 shadow-[0_18px_40px_rgba(3,7,18,0.35)] backdrop-blur"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-[#121a31] to-[#0f1528] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-sm font-medium text-slate-300">Attendance pace</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{summary?.attendancePace ?? '—'}</p>
                  <p className="mt-1 text-sm text-slate-400">{summary?.attendancePaceNote ?? 'of expected check-ins completed'}</p>
                </div>
                <StatusBadge variant="success" label={summary?.attendancePaceTrend ?? 'Live'} />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-sm font-medium text-slate-300">Risk indicators</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{summary?.riskCount ?? '—'}</p>
                  <p className="mt-1 text-sm text-slate-400">{summary?.riskNote ?? 'late patterns flagged today'}</p>
                </div>
                <StatusBadge variant="warning" label={summary?.riskTrend ?? 'Review needed'} />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">Recent activity</h3>
                <span className="text-xs font-medium text-slate-400">Live feed</span>
              </div>

              <ul className="mt-4 space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <li key={item.title} className="flex gap-3 rounded-xl border border-white/5 bg-[#0c1223]/70 px-3 py-3">
                      <span
                        className={`mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full ${
                          item.status === 'success'
                            ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
                            : 'bg-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <StatusBadge variant={item.status} label={item.time} />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <EmptyState
                    title="No recent activity"
                    description="Activity from attendance, approvals, and devices will appear here when available."
                  />
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">Priority tasks</h3>
                <span className="text-xs font-medium text-slate-400">Today</span>
              </div>

              <ul className="mt-4 space-y-3">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <li key={task} className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#0c1223]/70 px-3 py-3">
                      <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.12)]" />
                      <p className="text-sm leading-6 text-slate-300">{task}</p>
                    </li>
                  ))
                ) : (
                  <EmptyState
                    title="No priority tasks"
                    description="Open approvals, device alerts, and attendance exceptions will be listed here."
                  />
                )}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Operational queue"
          description="What needs your attention right now."
          className="border border-white/10 bg-[#10172a]/90 shadow-[0_18px_40px_rgba(3,7,18,0.35)] backdrop-blur"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Pending approvals</p>
                  <p className="mt-1 text-sm text-slate-400">Leave requests and attendance exceptions.</p>
                </div>
                <StatusBadge variant="warning" label={summary?.approvalQueueLabel ?? '—'} />
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Device alerts</p>
                  <p className="mt-1 text-sm text-slate-400">Monitor kiosks and biometric sync health.</p>
                </div>
                <StatusBadge variant="success" label={summary?.deviceAlertsLabel ?? '—'} />
              </div>
            </div>

            <EmptyState
              title="Dashboard insights will appear here"
              description="Connect Supabase queries and analytics charts to surface attendance performance, late arrivals, and leave load."
            />
          </div>
        </SectionCard>
      </section>
    </div>
  )
}