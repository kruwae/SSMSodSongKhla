import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'

export default function EmployeeHomePage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard title="Today" description="Quick access for your daily attendance flow.">
        <div className="flex flex-wrap gap-3">
          <StatusBadge status="success" label="Checked in" />
          <StatusBadge status="info" label="Office: Head Office" />
          <StatusBadge status="neutral" label="Shift ends 17:00" />
        </div>
      </SectionCard>

      <SectionCard title="Check-in status" description="Use the mobile wizard to capture attendance.">
        <EmptyState
          title="Ready for check-in"
          description="Open the check-in page to verify location, device, and submit today's attendance."
          action={<a className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/check-in">Open check-in</a>}
        />
      </SectionCard>
    </div>
  )
}