import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { LeaveRequest } from '../../types/app'

const leaves: LeaveRequest[] = [
  { id: '1', employeeName: 'Aree Samran', type: 'annual', startDate: '2026-04-15', endDate: '2026-04-16', status: 'submitted', reason: 'Family trip' },
  { id: '2', employeeName: 'Nattapong S.', type: 'sick', startDate: '2026-04-12', endDate: '2026-04-12', status: 'approved', reason: 'Medical appointment' },
]

const leaveStats = [
  { label: 'Requests', value: '2' },
  { label: 'Submitted', value: '1' },
  { label: 'Approved', value: '1' },
  { label: 'Pending review', value: '1' },
]

export default function AdminLeavesPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard title="Leave workflow" description="Track approvals, decisions, and upcoming absences across the team.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {leaveStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Leave requests"
        description="Approve, reject, and monitor employee leave submissions."
        actions={
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            Review queue
          </div>
        }
      >
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-4 shadow-[0_12px_30px_rgba(6,8,20,0.22)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Leave request</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{leave.employeeName}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {leave.type} · {leave.startDate} → {leave.endDate}
                  </p>
                  <p className="mt-3 text-sm text-slate-300">{leave.reason}</p>
                </div>
                <StatusBadge
                  variant={leave.status === 'approved' ? 'success' : leave.status === 'submitted' ? 'warning' : leave.status === 'rejected' ? 'danger' : 'neutral'}
                  label={leave.status}
                />
              </div>
            </div>
          ))}
        </div>
        {leaves.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No leave requests" description="Employee leave submissions will appear here for review." />
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}