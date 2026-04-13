import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminLeaveRequests, type LeaveRequestSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'คำขอทั้งหมด', value: '—' },
  { label: 'รออนุมัติ', value: '—' },
  { label: 'อนุมัติแล้ว', value: '—' },
  { label: 'ไม่อนุมัติ', value: '—' },
]

export default function AdminLeavesPage() {
  const leavesQuery = useQuery({
    queryKey: queryKeys.admin.leaves,
    queryFn: getAdminLeaveRequests,
  })

  const leaves: LeaveRequestSummary[] = leavesQuery.data?.data ?? []

  const leaveStats = leavesQuery.data
    ? [
        { label: 'คำขอทั้งหมด', value: String(leaves.length) },
        { label: 'รออนุมัติ', value: String(leaves.filter((item) => item.status === 'pending').length) },
        { label: 'อนุมัติแล้ว', value: String(leaves.filter((item) => item.status === 'approved').length) },
        { label: 'ไม่อนุมัติ', value: String(leaves.filter((item) => item.status === 'rejected').length) },
      ]
    : fallbackStats

  const isEmpty = !leavesQuery.isLoading && !leavesQuery.isError && leaves.length === 0

  const getLeaveLabel = (type: LeaveRequestSummary['type']) => {
    if (type === 'annual') return 'ลาพักผ่อน'
    if (type === 'sick') return 'ลาป่วย'
    if (type === 'personal') return 'ลากิจ'
    return 'ลาอื่น ๆ'
  }

  const getStatusLabel = (status: LeaveRequestSummary['status']) => {
    if (status === 'approved') return 'อนุมัติแล้ว'
    if (status === 'rejected') return 'ไม่อนุมัติ'
    if (status === 'cancelled') return 'ยกเลิก'
    return 'รออนุมัติ'
  }

  const getStatusVariant = (status: LeaveRequestSummary['status']) => {
    if (status === 'approved') return 'success' as const
    if (status === 'rejected') return 'danger' as const
    if (status === 'cancelled') return 'neutral' as const
    return 'warning' as const
  }

  return (
    <div className="space-y-5">
      <SectionCard title="ภาพรวมคำขอลา" description="สรุปจำนวนคำขอลาในแต่ละสถานะ เพื่อช่วยติดตามการอนุมัติได้รวดเร็ว">
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
        title="รายการคำขอลา"
        description="จัดวางเป็นการ์ดแบบแนวนอน เพื่อให้ดูชื่อผู้ขอ ช่วงเวลา และสถานะได้ในบรรทัดสั้นลง"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            ตรวจสอบล่าสุด
          </div>
        }
      >
        {leavesQuery.isLoading ? (
          <EmptyState title="กำลังโหลดคำขอลา" description="ระบบกำลังดึงข้อมูลจาก Supabase" />
        ) : leavesQuery.isError ? (
          <EmptyState title="ไม่สามารถโหลดคำขอลาได้" description="กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลแล้วลองใหม่อีกครั้ง" />
        ) : isEmpty ? (
          <EmptyState title="ยังไม่มีคำขอลา" description="เมื่อมีการยื่นคำขอ ข้อมูลจะแสดงในส่วนนี้" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {leaves.map((leave) => (
              <div key={leave.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold tracking-tight text-white">{leave.employeeName ?? 'ไม่ระบุชื่อ'}</p>
                    <p className="mt-1 text-sm text-slate-300">{getLeaveLabel(leave.type)}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {leave.startDate} - {leave.endDate}
                    </p>
                  </div>
                  <StatusBadge variant={getStatusVariant(leave.status)} label={getStatusLabel(leave.status)} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">เหตุผล</p>
                    <p className="mt-1 text-sm text-slate-200">{leave.reason}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">ผู้อนุมัติ</p>
                    <p className="mt-1 text-sm text-slate-200">{leave.approverName ?? 'ยังไม่ระบุ'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">หมายเหตุ</p>
                    <p className="mt-1 text-sm text-slate-200">{leave.reviewedNote ?? '—'}</p>
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
