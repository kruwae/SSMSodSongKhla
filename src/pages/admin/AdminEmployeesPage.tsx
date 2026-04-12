import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { EmployeeSummary } from '../../types/app'

const employees: EmployeeSummary[] = [
  { id: '1', fullName: 'Aree Samran', email: 'aree@example.com', role: 'employee', officeName: 'Head Office', status: 'active' },
  { id: '2', fullName: 'Nattapong S.', email: 'nattapong@example.com', role: 'employee', officeName: 'Branch Office', status: 'pending' },
]

export default function AdminEmployeesPage(): JSX.Element {
  return (
    <SectionCard title="Employees" description="Directory, assignment, and onboarding overview.">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr className="text-left text-sm text-slate-500">
              <th className="py-3 pr-4 font-medium">Name</th>
              <th className="py-3 pr-4 font-medium">Email</th>
              <th className="py-3 pr-4 font-medium">Office</th>
              <th className="py-3 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map((employee) => (
              <tr key={employee.id} className="text-sm">
                <td className="py-3 pr-4 font-medium text-slate-900">{employee.fullName}</td>
                <td className="py-3 pr-4 text-slate-600">{employee.email}</td>
                <td className="py-3 pr-4 text-slate-600">{employee.officeName ?? 'Unassigned'}</td>
                <td className="py-3 pr-4">
                  <StatusBadge
                    status={employee.status === 'active' ? 'success' : employee.status === 'pending' ? 'warning' : 'neutral'}
                    label={employee.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {employees.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No employees found" description="Add employees to start tracking attendance and leave." />
        </div>
      ) : null}
    </SectionCard>
  )
}