import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminOffices, type OfficeSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'สำนักงานทั้งหมด', value: '—' },
  { label: 'เปิดใช้งาน', value: '—' },
  { label: 'ปิดใช้งาน', value: '—' },
  { label: 'หน่วยงาน', value: '—' },
]

export default function AdminOfficesPage() {
  const officesQuery = useQuery({
    queryKey: queryKeys.admin.offices,
    queryFn: getAdminOffices,
  })

  const offices: OfficeSummary[] = officesQuery.data?.data ?? []

  const officeStats = officesQuery.data
    ? [
        { label: 'สำนักงานทั้งหมด', value: String(offices.length) },
        { label: 'เปิดใช้งาน', value: String(offices.filter((office) => office.isActive).length) },
        { label: 'ปิดใช้งาน', value: String(offices.filter((office) => !office.isActive).length) },
        { label: 'หน่วยงาน', value: String(new Set(offices.map((office) => office.departmentName).filter(Boolean)).size) },
      ]
    : fallbackStats

  const isEmpty = !officesQuery.isLoading && !officesQuery.isError && offices.length === 0

  return (
    <div className="space-y-5">
      <SectionCard title="ภาพรวมสำนักงาน" description="สรุปจำนวนสำนักงาน สถานะการเปิดใช้งาน และการกระจายตามหน่วยงาน">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {officeStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="รายการสำนักงาน"
        description="แสดงข้อมูลสำคัญแบบการ์ดแนวนอน เพื่อให้สแกนสถานะได้เร็วขึ้น"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            พร้อมใช้งาน
          </div>
        }
      >
        {officesQuery.isLoading ? (
          <EmptyState title="กำลังโหลดข้อมูลสำนักงาน" description="ระบบกำลังดึงข้อมูลจาก Supabase" />
        ) : officesQuery.isError ? (
          <EmptyState title="ไม่สามารถโหลดข้อมูลสำนักงานได้" description="กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลแล้วลองใหม่อีกครั้ง" />
        ) : isEmpty ? (
          <EmptyState title="ยังไม่มีข้อมูลสำนักงาน" description="เมื่อเพิ่มสำนักงานแล้ว ข้อมูลจะปรากฏในส่วนนี้" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {offices.map((office) => (
              <div key={office.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold tracking-tight text-white">{office.name}</p>
                    <p className="mt-1 text-sm text-slate-300">{office.code}</p>
                  </div>
                  <StatusBadge variant={office.isActive ? 'success' : 'neutral'} label={office.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน'} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">รหัส</p>
                    <p className="mt-1 text-sm text-slate-200">{office.code}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">หน่วยงาน</p>
                    <p className="mt-1 text-sm text-slate-200">{office.departmentName ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">สถานะ</p>
                    <p className="mt-1 text-sm text-slate-200">{office.isActive ? 'พร้อมใช้งาน' : 'ปิดใช้งาน'}</p>
                  </div>
                  <div className="rounded-xl border border-white/8 bg-white/[0.03] p-3 sm:col-span-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">ที่อยู่</p>
                    <p className="mt-1 text-sm text-slate-200">{office.address ?? 'ยังไม่กำหนด'}</p>
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