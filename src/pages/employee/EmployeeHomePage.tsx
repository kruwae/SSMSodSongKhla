import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock3, MapPin, Sparkles, BadgeInfo, ArrowRight } from 'lucide-react'

import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../features/auth/AuthProvider'
import { getEmployeeDashboard, type AttendanceSummary, type NotificationSummary, type LeaveRequestSummary } from '../../services/supabaseData'

type TodayStat = {
  label: string
  value: string
  variant: 'success' | 'warning' | 'neutral'
}

type EmployeeDashboardData = Awaited<ReturnType<typeof getEmployeeDashboard>>['data']

const fallbackStats: TodayStat[] = [
  { label: 'Attendance', value: 'No data', variant: 'neutral' },
  { label: 'Office', value: 'Unavailable', variant: 'neutral' },
  { label: 'Shift', value: 'Unavailable', variant: 'neutral' },
]

const quickActions = [
  { label: 'Open check-in', href: '/check-in', primary: true },
  { label: 'View attendance', href: '/employee/attendance', primary: false },
]

function buildTodayStats(session: EmployeeDashboardData['session'] | null, attendance: AttendanceSummary[], leaves: LeaveRequestSummary[], notifications: NotificationSummary[]): TodayStat[] {
  const latestAttendance = attendance[0] ?? null
  const latestLeave = leaves[0] ?? null
  const unreadNotifications = notifications.filter((item) => !item.isRead).length

  return [
    {
      label: 'Attendance',
      value: latestAttendance ? (latestAttendance.checkOutAt ? 'Completed' : 'Active') : 'No records',
      variant: latestAttendance ? 'success' : 'neutral',
    },
    {
      label: 'Office',
      value: session?.officeName ?? latestAttendance?.officeName ?? 'Unavailable',
      variant: session?.officeName ? 'success' : 'neutral',
    },
    {
      label: 'Shift',
      value: latestAttendance?.shiftName ?? latestLeave?.type ?? `${unreadNotifications} alerts`,
      variant: latestAttendance?.shiftName ? 'success' : 'neutral',
    },
  ]
}

export default function EmployeeHomePage(): JSX.Element {
  const { session, user } = useAuth()
  const profileId = session?.userId ?? user?.id ?? null

  const { data } = useQuery({
    queryKey: ['employee-dashboard', profileId ?? 'anonymous'],
    queryFn: () => getEmployeeDashboard(profileId),
    enabled: Boolean(profileId),
  })

  const dashboard = data?.data
  const todayStats = dashboard ? buildTodayStats(dashboard.session, dashboard.attendance, dashboard.leaves, dashboard.notifications) : fallbackStats
  const hasCheckInData = Boolean(dashboard?.attendance?.length)
  const notes =
    dashboard?.notifications?.slice(0, 3).map((notification) => notification.title) ?? [
      'Verify your location before submitting check-in.',
      'Keep your shift time handy for quick reference.',
      'Review profile details before requesting leave.',
    ]

  const latestAttendance = dashboard?.attendance?.[0] ?? null
  const latestStatusLabel = latestAttendance ? (latestAttendance.lateStatus ? 'Late' : latestAttendance.checkOutAt ? 'Present' : 'In progress') : 'No record'

  return (
    <div className="space-y-5">
      <SectionCard
        className="overflow-hidden"
        title="Employee home"
        description="A mobile-first dashboard for attendance, reminders, and quick actions."
        actions={
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsla(var(--accent),0.18)] bg-[hsla(var(--accent),0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(var(--accent-foreground))]">
            <Sparkles className="h-3.5 w-3.5" />
            Today
          </div>
        }
      >
        <div className="relative overflow-hidden rounded-[1.5rem] border border-[hsla(var(--border),0.85)] bg-[linear-gradient(180deg,rgba(25,34,74,0.98),rgba(15,23,42,0.95))] p-4 shadow-[0_24px_60px_rgba(6,8,20,0.28)] sm:p-5">
          <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2),transparent_65%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-[hsla(var(--ring),0.2)] bg-[hsla(var(--ring),0.1)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--ring))]">
                <BadgeInfo className="h-3.5 w-3.5" />
                Attendance snapshot
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-3xl">
                Welcome back{session?.fullName ? `, ${session.fullName}` : ''}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                Check your status, open attendance, and keep your daily workflow aligned with office and shift details.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <a
                    key={action.label}
                    href={action.href}
                    className={
                      action.primary
                        ? 'inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]'
                        : 'inline-flex items-center justify-center gap-2 rounded-2xl border border-[hsla(var(--border),0.9)] bg-[hsla(var(--surface),0.8)] px-4 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsla(var(--ring),0.3)] hover:bg-[hsla(var(--surface-elevated),0.85)]'
                    }
                  >
                    {action.label}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[24rem] lg:grid-cols-1 xl:min-w-[28rem] xl:grid-cols-3">
              {todayStats.map((item) => (
                <div key={item.label} className="rounded-[1.25rem] border border-[hsla(var(--border),0.85)] bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">{item.label}</p>
                  <div className="mt-3 flex items-start justify-between gap-3">
                    <p className="text-xl font-black tracking-[-0.03em] text-[hsl(var(--foreground))]">{item.value}</p>
                    <StatusBadge label={item.value} variant={item.variant} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SectionCard
          title="Attendance status"
          description="Your latest check-in context and quick action area."
          actions={
            <div className="inline-flex items-center gap-2 rounded-full border border-[hsla(var(--accent),0.16)] bg-[hsla(var(--accent),0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[hsl(var(--accent))]">
              <Clock3 className="h-3.5 w-3.5" />
              Live
            </div>
          }
        >
          {hasCheckInData ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-[hsla(var(--border),0.85)] bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">Latest check-in</p>
                  <p className="mt-2 text-lg font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                    {dashboard?.attendance?.[0]?.checkInAt ?? '—'}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[hsla(var(--border),0.85)] bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">Latest check-out</p>
                  <p className="mt-2 text-lg font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">
                    {dashboard?.attendance?.[0]?.checkOutAt ?? '—'}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-[hsla(var(--border),0.85)] bg-[rgba(255,255,255,0.04)] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">Latest status</p>
                  <p className="mt-2 text-lg font-bold tracking-[-0.02em] text-[hsl(var(--foreground))]">{latestStatusLabel}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[hsla(var(--border),0.85)] bg-[linear-gradient(180deg,rgba(20,26,48,0.9),rgba(13,17,30,0.92))] p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Quick reminder</p>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                      Verify your location and face proof before submitting the next attendance action.
                    </p>
                  </div>
                  <a
                    href="/check-in"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]"
                  >
                    Open check-in
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Ready for check-in"
              description="Open the check-in page to verify location, device, and submit today's attendance."
              action={
                <a
                  className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]"
                  href="/check-in"
                >
                  Open check-in
                </a>
              }
            />
          )}
        </SectionCard>

        <SectionCard title="Quick notes" description="Helpful reminders for your daily workflow.">
          <div className="space-y-3">
            {notes.map((note, index) => (
              <div key={`${note}-${index}`} className="rounded-[1.25rem] border border-[hsla(var(--border),0.85)] bg-[rgba(255,255,255,0.04)] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[hsla(var(--ring),0.12)] text-xs font-bold text-[hsl(var(--ring))]">
                    {index + 1}
                  </span>
                  <p className="text-sm leading-6 text-[hsl(var(--muted-foreground))]">{note}</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}