import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'

const rows = [
  { date: '2026-04-12', status: 'present', hours: '8.8' },
  { date: '2026-04-11', status: 'late', hours: '8.1' },
]

export default function EmployeeAttendancePage(): JSX.Element {
  return (
    <SectionCard title="My attendance" description="View your attendance history and work hours.">
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.date} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
            <div>
              <h3 className="font-medium text-slate-900">{row.date}</h3>
              <p className="text-sm text-slate-500">{row.hours} hours</p>
            </div>
            <StatusBadge
              status={row.status === 'present' ? 'success' : row.status === 'late' ? 'warning' : 'neutral'}
              label={row.status}
            />
          </div>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No attendance data" description="Your attendance history will be shown here." />
        </div>
      ) : null}
    </SectionCard>
  )
}