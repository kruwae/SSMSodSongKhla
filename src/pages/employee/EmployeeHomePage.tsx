import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'

const todayStats = [
  { label: 'Attendance', value: 'Checked in', variant: 'success' as const },
  { label: 'Office', value: 'Head Office', variant: 'info' as const },
  { label: 'Shift', value: 'Ends 17:00', variant: 'gold' as const },
]

const quickActions = [
  { label: 'Open check-in', href: '/check-in', primary: true },
  { label: 'View profile', href: '/employee/profile', primary: false },
]

export default function EmployeeHomePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Today"
        description="A quick snapshot of your attendance state, shift timing, and office context."
        className="relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 h-32 w-32 translate-x-10 -translate-y-10 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.14),transparent_68%)]" />
        <div className="grid gap-3 sm:grid-cols-3">
          {todayStats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
                {item.label}
              </p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xl font-bold tracking-tight text-[hsl(var(--foreground))]">{item.value}</p>
                <StatusBadge label={item.value} variant={item.variant} />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <SectionCard
          title="Check-in status"
          description="Use the mobile wizard to capture attendance quickly and confidently."
          actions={
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className={
                    action.primary
                      ? 'inline-flex items-center justify-center rounded-xl bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]'
                      : 'inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-[hsl(var(--foreground))] transition hover:border-[hsla(var(--ring),0.3)] hover:bg-white/7'
                  }
                >
                  {action.label}
                </a>
              ))}
            </div>
          }
        >
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
        </SectionCard>

        <SectionCard title="Quick notes" description="Helpful reminders for your daily workflow.">
          <div className="space-y-3">
            {[
              'Verify your location before submitting check-in.',
              'Keep your shift time handy for quick reference.',
              'Review profile details before requesting leave.',
            ].map((note, index) => (
              <div key={note} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[hsla(var(--ring),0.12)] text-xs font-bold text-[#fde68a]">
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