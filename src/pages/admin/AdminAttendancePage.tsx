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
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
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
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-white/[0.03]">
                  <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-400">
                    <th className="py-3.5 pl-4 pr-4 font-semibold">บุคลากร</th>
                    <th className="py-3.5 pr-4 font-semibold">สำนักงาน</th>
                    <th className="py-3.5 pr-4 font-semibold">เวลาเข้า</th>
                    <th className="py-3.5 pr-4 font-semibold">เวลาออก</th>
                    <th className="py-3.5 pr-4 font-semibold">สถานะ</th>
                    <th className="py-3.5 pr-4 font-semibold">ชั่วโมง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-slate-950/30">
                  {records.map((record) => (
                    <tr key={record.id} className="text-sm transition-colors hover:bg-white/[0.03]">
                      <td className="py-4 pl-4 pr-4">
                        <div>
                          <p className="font-semibold tracking-tight text-white">{record.employeeName ?? 'ไม่ระบุชื่อ'}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500">{record.shiftName ?? 'ไม่ระบุกะ'}</p>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{record.officeName ?? '—'}</td>
                      <td className="py-4 pr-4 text-slate-300">{new Date(record.checkInAt).toLocaleString('th-TH')}</td>
                      <td className="py-4 pr-4 text-slate-300">{record.checkOutAt ? new Date(record.checkOutAt).toLocaleString('th-TH') : 'ยังไม่เช็กเอาต์'}</td>
                      <td className="py-4 pr-4">
                        <StatusBadge
                          variant={record.lateStatus ? 'warning' : 'success'}
                          label={record.lateStatus ? 'มาสาย' : 'ตรงเวลา'}
                        />
                      </td>
                      <td className="py-4 pr-4 text-slate-300">{record.workHours ?? '-'}</td>
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
