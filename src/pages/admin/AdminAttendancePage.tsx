import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminAttendanceRecords, type AttendanceSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'ลงเวลาทั้งหมด', value: '—' },
  { label: 'มาสาย', value: '—' },
  { label: 'กำลังปฏิบัติงาน', value: '—' },
  { label: 'ชั่วโมงเฉลี่ย', value: '—' },
]

export default function AdminAttendancePage() {
  const attendanceQuery = useQuery({
    queryKey: queryKeys.admin.attendance,
    queryFn: getAdminAttendanceRecords,
  })

  const records: AttendanceSummary[] = attendanceQuery.data?.data ?? []

  const attendanceStats = attendanceQuery.data
    ? [
        { label: 'ลงเวลาทั้งหมด', value: String(records.length) },
        { label: 'มาสาย', value: String(records.filter((record) => record.lateStatus).length) },
        { label: 'กำลังปฏิบัติงาน', value: String(records.filter((record) => !record.checkOutAt).length) },
        {
          label: 'ชั่วโมงเฉลี่ย',
          value:
            records.length > 0
              ? (records.reduce((total, record) => total + (record.workHours ?? 0), 0) / records.length).toFixed(1)
              : '0.0',
        },
      ]
    : fallbackStats

  const isEmpty = !attendanceQuery.isLoading && !attendanceQuery.isError && records.length === 0

  return (
    <div className="space-y-5">
      <SectionCard title="ภาพรวมการลงเวลา" description="สรุปจำนวนผู้ลงเวลา ผู้มาสาย ผู้ที่ยังไม่เช็กเอาต์ และชั่วโมงทำงานเฉลี่ย">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {attendanceStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="รายการลงเวลา"
        description="ดูเวลาเข้าออกงาน สถานะการมาสาย และสรุปชั่วโมงทำงาน"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            อัปเดตล่าสุด
          </div>
        }
      >
        {attendanceQuery.isLoading ? (
          <EmptyState title="กำลังโหลดข้อมูลการลงเวลา" description="ระบบกำลังดึงข้อมูลจาก Supabase" />
        ) : attendanceQuery.isError ? (
          <EmptyState title="ไม่สามารถโหลดข้อมูลการลงเวลาได้" description="กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลแล้วลองใหม่อีกครั้ง" />
        ) : isEmpty ? (
          <EmptyState title="ยังไม่มีข้อมูลการลงเวลา" description="เมื่อบุคลากรเริ่มลงเวลา ข้อมูลจะแสดงในส่วนนี้" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {records.map((record) => (
              <div key={record.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold tracking-tight text-white">{record.employeeName ?? 'ไม่ระบุชื่อ'}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{record.shiftName ?? 'ไม่ระบุกะ'}</p>
                  </div>
                  <StatusBadge
                    variant={record.lateStatus ? 'warning' : 'success'}
                    label={record.lateStatus ? 'มาสาย' : 'ตรงเวลา'}
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">สำนักงาน</p>
                    <p className="mt-1 text-sm text-slate-200">{record.officeName ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">ชั่วโมง</p>
                    <p className="mt-1 text-sm text-slate-200">{record.workHours ?? '-'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">เวลาเข้า</p>
                    <p className="mt-1 text-sm text-slate-200">{new Date(record.checkInAt).toLocaleString('th-TH')}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">เวลาออก</p>
                    <p className="mt-1 text-sm text-slate-200">{record.checkOutAt ? new Date(record.checkOutAt).toLocaleString('th-TH') : 'ยังไม่เช็กเอาต์'}</p>
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