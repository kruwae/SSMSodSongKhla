import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'

const metrics = [
  { label: 'Today check-ins', value: '128', trend: '+12%' },
  { label: 'On time', value: '104', trend: '+8%' },
  { label: 'Leave requests', value: '7', trend: 'Needs review' },
  { label: 'Active devices', value: '18', trend: '2 pending' },
]

export default function AdminDashboardPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <SectionCard key={metric.label} title={metric.label}>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-semibold text-slate-900">{metric.value}</p>
              <StatusBadge status={metric.trend.includes('Needs') ? 'warning' : 'success'} label={metric.trend} />
            </div>
          </SectionCard>
        ))}
      </section>

      <SectionCard title="Operational summary" description="Placeholder dashboard panels for attendance leaders.">
        <EmptyState
          title="Dashboard insights will appear here"
          description="Connect Supabase queries and analytics charts to surface attendance performance, late arrivals, and leave load."
        />
      </SectionCard>
    </div>
  )
}