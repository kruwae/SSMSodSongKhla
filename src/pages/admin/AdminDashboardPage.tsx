import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'

const metrics = [
  {
    label: 'Today check-ins',
    value: '128',
    trend: '+12%',
    note: 'vs yesterday',
  },
  {
    label: 'On time',
    value: '104',
    trend: '+8%',
    note: 'strong morning flow',
  },
  {
    label: 'Leave requests',
    value: '7',
    trend: 'Needs review',
    note: '3 awaiting approval',
  },
  {
    label: 'Active devices',
    value: '18',
    trend: '2 pending',
    note: '1 offline kiosk',
  },
]

const recentActivity = [
  {
    title: 'Morning attendance batch completed',
    detail: '114 employees checked in before 8:30 AM.',
    time: '5 min ago',
    status: 'success' as const,
  },
  {
    title: 'Pending leave request from Finance',
    detail: 'One paid leave request is waiting for manager approval.',
    time: '18 min ago',
    status: 'warning' as const,
  },
  {
    title: 'Device sync finished for HQ lobby',
    detail: 'Attendance kiosk synced successfully with the latest roster.',
    time: '42 min ago',
    status: 'success' as const,
  },
]

const upcomingTasks = [
  'Review late arrivals for today’s second shift.',
  'Approve or reject pending leave requests.',
  'Check device health for the south entrance kiosk.',
]

export default function AdminDashboardPage(): JSX.Element {
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
              <p className="mt-1 text-2xl font-semibold text-white">4</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Approval queue</p>
              <p className="mt-1 text-2xl font-semibold text-white">7</p>
            </div>
            <div className="rounded-2xl border border-sky-400/20 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Device health</p>
              <p className="mt-1 text-2xl font-semibold text-white">94%</p>
            </div>
          </div>
        </div>
      </section>

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
                  variant={metric.trend.includes('Needs') || metric.trend.includes('pending') ? 'warning' : 'success'}
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
                  <p className="text-2xl font-semibold text-white">86%</p>
                  <p className="mt-1 text-sm text-slate-400">of expected check-ins completed</p>
                </div>
                <StatusBadge variant="success" label="+12% from last week" />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-sm font-medium text-slate-300">Risk indicators</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">3</p>
                  <p className="mt-1 text-sm text-slate-400">late patterns flagged today</p>
                </div>
                <StatusBadge variant="warning" label="Review needed" />
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
                {recentActivity.map((item) => (
                  <li key={item.title} className="flex gap-3 rounded-xl border border-white/5 bg-[#0c1223]/70 px-3 py-3">
                    <span
                      className={`mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full ${
                        item.status === 'success' ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]' : 'bg-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]'
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
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">Priority tasks</h3>
                <span className="text-xs font-medium text-slate-400">Today</span>
              </div>

              <ul className="mt-4 space-y-3">
                {upcomingTasks.map((task) => (
                  <li key={task} className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#0c1223]/70 px-3 py-3">
                    <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.12)]" />
                    <p className="text-sm leading-6 text-slate-300">{task}</p>
                  </li>
                ))}
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
                <StatusBadge variant="warning" label="7 open" />
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">Device alerts</p>
                  <p className="mt-1 text-sm text-slate-400">Monitor kiosks and biometric sync health.</p>
                </div>
                <StatusBadge variant="success" label="2 resolved" />
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