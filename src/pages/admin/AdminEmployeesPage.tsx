import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { EmployeeSummary } from '../../types/app'
import { getAdminEmployees } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'Total employees', value: '—' },
  { label: 'Active', value: '—' },
  { label: 'Pending', value: '—' },
  { label: 'Assigned offices', value: '—' },
]

export default function AdminEmployeesPage(): JSX.Element {
  const employeesQuery = useQuery({
    queryKey: queryKeys.admin.employees(),
    queryFn: getAdminEmployees,
  })

  const employees: EmployeeSummary[] = employeesQuery.data ?? []

  const employeeStats = employeesQuery.data
    ? [
        { label: 'Total employees', value: String(employees.length) },
        { label: 'Active', value: String(employees.filter((employee) => employee.status === 'active').length) },
        { label: 'Pending', value: String(employees.filter((employee) => employee.status === 'pending').length) },
        {
          label: 'Assigned offices',
          value: String(new Set(employees.map((employee) => employee.officeName).filter(Boolean)).size),
        },
      ]
    : fallbackStats

  const isEmpty = !employeesQuery.isLoading && !employeesQuery.isError && employees.length === 0

  return (
    <div className="space-y-6">
      <SectionCard
        title="Employee directory"
        description="Review onboarding status, office assignment, and account readiness across the workforce."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {employeeStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Employees"
        description="Directory, assignment, and onboarding overview with status-ready actions."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            Directory synced
          </div>
        }
      >
        {employeesQuery.isLoading ? (
          <EmptyState title="Loading employees" description="Fetching directory data from Supabase." />
        ) : employeesQuery.isError ? (
          <EmptyState title="Unable to load employees" description="Please check the Supabase connection and try again." />
        ) : isEmpty ? (
          <EmptyState title="No employees found" description="Add employees to start tracking attendance, leave, and device access." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/[0.03]">
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th className="py-3.5 pl-4 pr-4 font-semibold">Name</th>
                    <th className="py-3.5 pr-4 font-semibold">Email</th>
                    <th className="py-3.5 pr-4 font-semibold">Office</th>
                    <th className="py-3.5 pr-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/30">
                  {employees.map((employee) => (
                    <tr key={employee.id} className="text-sm transition-colors hover:bg-white/[0.03]">
                      <td className="py-4 pl-4 pr-4">
                        <div>
                          <p className="font-semibold tracking-tight text-white">{employee.fullName}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{employee.role}</p>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{employee.email}</td>
                      <td className="py-4 pr-4 text-slate-300">{employee.officeName ?? 'Unassigned'}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge
                          variant={employee.status === 'active' ? 'success' : employee.status === 'pending' ? 'warning' : 'neutral'}
                          label={employee.status}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  )
}