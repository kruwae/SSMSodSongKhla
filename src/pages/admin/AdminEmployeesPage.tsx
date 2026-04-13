import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminEmployees, type EmployeeSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'บุคลากรทั้งหมด', value: '—' },
  { label: 'เปิดใช้งาน', value: '—' },
  { label: 'ผู้ดูแลระบบ', value: '—' },
  { label: 'สำนักงาน', value: '—' },
]

export default function AdminEmployeesPage() {
  const employeesQuery = useQuery({
    queryKey: queryKeys.admin.employees,
    queryFn: getAdminEmployees,
  })

  const employees: EmployeeSummary[] = employeesQuery.data?.data ?? []

  const employeeStats = employeesQuery.data
    ? [
        { label: 'บุคลากรทั้งหมด', value: String(employees.length) },
        { label: 'เปิดใช้งาน', value: String(employees.filter((employee) => employee.isActive).length) },
        { label: 'ผู้ดูแลระบบ', value: String(employees.filter((employee) => employee.role === 'admin').length) },
        { label: 'สำนักงาน', value: String(new Set(employees.map((employee) => employee.officeName).filter(Boolean)).size) },
      ]
    : fallbackStats

  const isEmpty = !employeesQuery.isLoading && !employeesQuery.isError && employees.length === 0

  return (
    <div className="space-y-5">
      <SectionCard title="ภาพรวมบุคลากร" description="สรุปจำนวนบุคลากร สถานะการใช้งาน และการกระจายตามสำนักงาน">
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
        title="รายชื่อบุคลากร"
        description="ดูข้อมูลผู้ใช้งาน บทบาท สำนักงาน และสถานะการใช้งานแบบย่อ"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            ซิงก์แล้ว
          </div>
        }
      >
        {employeesQuery.isLoading ? (
          <EmptyState title="กำลังโหลดข้อมูลบุคลากร" description="ระบบกำลังดึงข้อมูลจาก Supabase" />
        ) : employeesQuery.isError ? (
          <EmptyState title="ไม่สามารถโหลดข้อมูลบุคลากรได้" description="กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลแล้วลองใหม่อีกครั้ง" />
        ) : isEmpty ? (
          <EmptyState title="ยังไม่มีข้อมูลบุคลากร" description="เมื่อเพิ่มผู้ใช้งานแล้ว ข้อมูลจะปรากฏในส่วนนี้" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {employees.map((employee) => (
              <div key={employee.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold tracking-tight text-white">{employee.fullName}</p>
                    <p className="mt-1 text-sm text-slate-300">{employee.email}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {employee.role === 'admin' ? 'ผู้ดูแลระบบ' : 'บุคลากร'}
                    </p>
                  </div>
                  <StatusBadge variant={employee.isActive ? 'success' : 'neutral'} label={employee.isActive ? 'ใช้งานอยู่' : 'ปิดใช้งาน'} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">สำนักงาน</p>
                    <p className="mt-1 text-sm text-slate-200">{employee.officeName ?? 'ยังไม่กำหนด'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">หน่วยงาน</p>
                    <p className="mt-1 text-sm text-slate-200">{employee.departmentName ?? 'ยังไม่กำหนด'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">รหัสบุคลากร</p>
                    <p className="mt-1 text-sm text-slate-200">{employee.employeeCode ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">เบอร์โทร</p>
                    <p className="mt-1 text-sm text-slate-200">{employee.phone ?? '—'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
