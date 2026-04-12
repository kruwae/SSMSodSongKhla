import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { LeaveRequest } from '../../types/app'

const leaves: LeaveRequest[] = [
  { id: '1', employeeName: 'Aree Samran', type: 'annual', startDate: '2026-04-15', endDate: '2026-04-16', status: 'submitted', reason: 'Family trip' },
  { id: '2', employeeName: 'Nattapong S.', type: 'sick', startDate: '2026-04-12', endDate: '2026-04-12', status: 'approved', reason: 'Medical appointment' },
]

export default function AdminLeavesPage(): JSX.Element {
  return (
    <SectionCard title="Leave requests" description="Approve, reject, and monitor employee leave requests.">
      <div className="space-y-3">
        {leaves.map((leave) => (
          <div key={leave.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-slate-900">{leave.employeeName}</h3>
                <p className="text-sm text-slate-500">
                  {leave.type} · {leave.startDate} → {leave.endDate}
                </p>
              </div>
              <StatusBadge
                status={leave.status === 'approved' ? 'success' : leave.status === 'submitted' ? 'warning' : leave.status === 'rejected' ? 'danger' : 'neutral'}
                label={leave.status}
              />
            </div>
            <p className="mt-3 text-sm text-slate-600">{leave.reason}</p>
          </div>
        ))}
      </div>
      {leaves.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No leave requests" description="Employee leave submissions will appear here for review." />
        </div>
      ) : null}
    </SectionCard>
  )
}