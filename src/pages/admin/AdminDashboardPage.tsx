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
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
              Admin overview
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Attendance dashboard</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-600 md:text-base">
                Track check-ins, approvals, and device health from one clean workspace built for daily attendance operations.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Shifts live</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">4</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Approval queue</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">7</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Device health</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">94%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <SectionCard
            key={metric.label}
            className="h-full border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            title={metric.label}
          >
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <p className="text-3xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
                <StatusBadge
                  status={metric.trend.includes('Needs') || metric.trend.includes('pending') ? 'warning' : 'success'}
                  label={metric.trend}
                />
              </div>
              <p className="text-sm text-slate-500">{metric.note}</p>
            </div>
          </SectionCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <SectionCard
          title="Operational summary"
          description="A quick snapshot of attendance momentum, pending work, and device status."
          className="border-slate-200 bg-white shadow-sm"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-600">Attendance pace</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">86%</p>
                  <p className="mt-1 text-sm text-slate-500">of expected check-ins completed</p>
                </div>
                <StatusBadge status="success" label="+12% from last week" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-600">Risk indicators</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-slate-900">3</p>
                  <p className="mt-1 text-sm text-slate-500">late patterns flagged today</p>
                </div>
                <StatusBadge status="warning" label="Review needed" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-900">Recent activity</h3>
                <span className="text-xs font-medium text-slate-500">Live feed</span>
              </div>

              <ul className="mt-4 space-y-4">
                {recentActivity.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <span
                      className={`mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full ${
                        item.status === 'success' ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <StatusBadge status={item.status} label={item.time} />
                      </div>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{item.detail}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-slate-900">Priority tasks</h3>
                <span className="text-xs font-medium text-slate-500">Today</span>
              </div>

              <ul className="mt-4 space-y-3">
                {upcomingTasks.map((task) => (
                  <li key={task} className="flex items-start gap-3 rounded-xl bg-slate-50 px-3 py-3">
                    <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-sky-500" />
                    <p className="text-sm leading-6 text-slate-700">{task}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Operational queue"
          description="What needs your attention right now."
          className="border-slate-200 bg-white shadow-sm"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Pending approvals</p>
                  <p className="mt-1 text-sm text-slate-600">Leave requests and attendance exceptions.</p>
                </div>
                <StatusBadge status="warning" label="7 open" />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-900">Device alerts</p>
                  <p className="mt-1 text-sm text-slate-600">Monitor kiosks and biometric sync health.</p>
                </div>
                <StatusBadge status="success" label="2 resolved" />
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