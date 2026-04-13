import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminDashboardSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

type DashboardMetric = {
  label: string
  value: string
  trend: string
  note: string
}

const fallbackMetrics: DashboardMetric[] = [
  {
    label: 'ลงชื่อวันนี้',
    value: '—',
    trend: 'รอข้อมูล',
    note: 'ข้อมูลจาก Supabase',
  },
  {
    label: 'บุคลากรทั้งหมด',
    value: '—',
    trend: 'รอข้อมูล',
    note: 'รวมผู้ดูแลและบุคลากร',
  },
  {
    label: 'คำขอลา',
    value: '—',
    trend: 'รอข้อมูล',
    note: 'สถานะรออนุมัติ',
  },
  {
    label: 'อุปกรณ์ที่ยืนยันแล้ว',
    value: '—',
    trend: 'รอข้อมูล',
    note: 'อุปกรณ์พร้อมใช้งาน',
  },
]

export default function AdminDashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: queryKeys.admin.dashboard,
    queryFn: getAdminDashboardSummary,
  })

  const summary = dashboardQuery.data?.data
  const stats = summary?.stats

  const lateCount = summary?.attendance.filter((item) => item.lateStatus).length ?? 0
  const approvalQueueCount = summary?.leaves.filter((item) => item.status === 'pending').length ?? 0
  const onlineDeviceCount = summary?.devices.filter((item) => item.isVerified).length ?? 0

  const metrics: DashboardMetric[] = stats
    ? [
        {
          label: 'ลงชื่อวันนี้',
          value: String(stats.attendanceToday),
          trend: stats.attendanceToday > 0 ? 'เชื่อมต่อสด' : 'รอข้อมูล',
          note: 'ข้อมูลจาก Supabase',
        },
        {
          label: 'บุคลากรทั้งหมด',
          value: String(stats.employees),
          trend: 'พร้อมใช้งาน',
          note: 'รวมผู้ดูแลและบุคลากร',
        },
        {
          label: 'คำขอลา',
          value: String(stats.pendingLeaves),
          trend: stats.pendingLeaves > 0 ? 'รอตรวจสอบ' : 'ปกติ',
          note: 'สถานะรออนุมัติ',
        },
        {
          label: 'อุปกรณ์ที่ยืนยันแล้ว',
          value: String(stats.activeDevices),
          trend: stats.activeDevices > 0 ? 'ออนไลน์' : 'ยังไม่มี',
          note: 'อุปกรณ์พร้อมใช้งาน',
        },
      ]
    : fallbackMetrics

  const recentActivity =
    summary?.attendance.slice(0, 4).map((item) => ({
      title: item.employeeName ?? 'ไม่ระบุชื่อ',
      detail: `เช็กอิน ${new Date(item.checkInAt).toLocaleString('th-TH')}${item.officeName ? ` • ${item.officeName}` : ''}`,
      time: item.lateStatus ? 'มาสาย' : 'ตรงเวลา',
      status: item.lateStatus ? ('warning' as const) : ('success' as const),
    })) ?? []

  const upcomingTasks =
    summary?.leaves.slice(0, 4).map((item) => {
      const employeeName = item.employeeName ?? 'ไม่ระบุชื่อ'
      return `${employeeName} • ${item.type} • ${item.status}`
    }) ?? []

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] border border-amber-300/20 bg-gradient-to-br from-[#17182f] via-[#11172b] to-[#0b1020] p-6 shadow-[0_24px_80px_rgba(3,7,18,0.55)] sm:p-7">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.22),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(168,85,247,0.18),_transparent_36%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center rounded-full border border-amber-300/25 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.06)]">
              ภาพรวมผู้ดูแลระบบ
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">แดชบอร์ดการลงเวลาปฏิบัติงาน</h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300 md:text-base">
                ติดตามการเช็กชื่อ การอนุมัติคำขอ และสถานะอุปกรณ์จากศูนย์กลางข้อมูลเดียวสำหรับการปฏิบัติงานประจำวัน
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">รายการลงเวลาล่าสุด</p>
              <p className="mt-1 text-2xl font-semibold text-white">{summary?.attendance.length ?? '—'}</p>
            </div>
            <div className="rounded-2xl border border-amber-300/20 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">รายการรออนุมัติ</p>
              <p className="mt-1 text-2xl font-semibold text-white">{approvalQueueCount}</p>
            </div>
            <div className="rounded-2xl border border-sky-400/20 bg-white/7 px-4 py-3 shadow-[0_14px_30px_rgba(2,6,23,0.28)] backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">อุปกรณ์ที่ออนไลน์</p>
              <p className="mt-1 text-2xl font-semibold text-white">{onlineDeviceCount}</p>
            </div>
          </div>
        </div>
      </section>

      {dashboardQuery.isLoading ? (
        <SectionCard title="กำลังโหลดข้อมูลแดชบอร์ด" description="กำลังดึงข้อมูลการลงเวลาจาก Supabase">
          <EmptyState title="กำลังโหลดแดชบอร์ด" description="กรุณารอสักครู่ ระบบกำลังโหลดข้อมูลล่าสุด" />
        </SectionCard>
      ) : null}

      {dashboardQuery.isError ? (
        <SectionCard title="ไม่สามารถโหลดแดชบอร์ดได้" description="เกิดปัญหาในการดึงข้อมูลจาก Supabase">
          <EmptyState title="โหลดข้อมูลไม่สำเร็จ" description="กรุณาตรวจสอบการเชื่อมต่อ Supabase แล้วลองใหม่อีกครั้ง" />
        </SectionCard>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <SectionCard
            key={metric.label}
            className="h-full border border-white/10 bg-[#10172a]/90 shadow-[0_18px_40px_rgba(3,7,18,0.35)] backdrop-blur"
            title={metric.label}
          >
            <div className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <p className="text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
                <StatusBadge
                  variant={metric.trend.includes('รอ') ? 'warning' : 'success'}
                  label={metric.trend}
                />
              </div>
              <p className="text-sm text-slate-400">{metric.note}</p>
            </div>
          </SectionCard>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <SectionCard
          title="สรุปการปฏิบัติงาน"
          description="ภาพรวมการลงเวลา งานที่รอดำเนินการ และสถานะอุปกรณ์"
          className="border border-white/10 bg-[#10172a]/90 shadow-[0_18px_40px_rgba(3,7,18,0.35)] backdrop-blur"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-[#121a31] to-[#0f1528] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-sm font-medium text-slate-300">ความคืบหน้าการลงเวลา</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{stats?.attendanceToday ?? '—'}</p>
                  <p className="mt-1 text-sm text-slate-400">จำนวนรายการลงเวลาวันนี้</p>
                </div>
                <StatusBadge variant="success" label="สด" />
              </div>
            </div>

            <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
              <p className="text-sm font-medium text-slate-300">ตัวชี้วัดความเสี่ยง</p>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold text-white">{lateCount}</p>
                  <p className="mt-1 text-sm text-slate-400">จำนวนบุคลากรที่มาสายจากข้อมูลล่าสุด</p>
                </div>
                <StatusBadge variant="warning" label="ตรวจสอบ" />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">กิจกรรมล่าสุด</h3>
                <span className="text-xs font-medium text-slate-400">ข้อมูลสด</span>
              </div>

              <ul className="mt-4 space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item) => (
                    <li key={`${item.title}-${item.detail}`} className="flex gap-3 rounded-xl border border-white/5 bg-[#0c1223]/70 px-3 py-3">
                      <span
                        className={`mt-1 inline-flex h-2.5 w-2.5 flex-none rounded-full ${
                          item.status === 'success'
                            ? 'bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]'
                            : 'bg-amber-400 shadow-[0_0_0_4px_rgba(245,158,11,0.12)]'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-white">{item.title}</p>
                          <StatusBadge variant={item.status} label={item.time} />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-400">{item.detail}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <EmptyState
                    title="ยังไม่มีกิจกรรมล่าสุด"
                    description="เมื่อมีการเช็กชื่อ อนุมัติคำขอ หรืออัปเดตอุปกรณ์ ระบบจะแสดงที่นี่"
                  />
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-white">งานสำคัญวันนี้</h3>
                <span className="text-xs font-medium text-slate-400">วันนี้</span>
              </div>

              <ul className="mt-4 space-y-3">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => (
                    <li key={task} className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#0c1223]/70 px-3 py-3">
                      <span className="mt-1 inline-flex h-2 w-2 flex-none rounded-full bg-sky-400 shadow-[0_0_0_4px_rgba(56,189,248,0.12)]" />
                      <p className="text-sm leading-6 text-slate-300">{task}</p>
                    </li>
                  ))
                ) : (
                  <EmptyState
                    title="ยังไม่มีงานสำคัญ"
                    description="รายการคำขอ การแจ้งเตือน และงานที่ต้องติดตามจะแสดงในส่วนนี้"
                  />
                )}
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="คิวงานที่ต้องติดตาม"
          description="สิ่งที่ผู้ดูแลระบบควรตรวจสอบในขณะนี้"
          className="border border-white/10 bg-[#10172a]/90 shadow-[0_18px_40px_rgba(3,7,18,0.35)] backdrop-blur"
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-300/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">คำขอที่รออนุมัติ</p>
                  <p className="mt-1 text-sm text-slate-400">รวมคำขอลาและรายการที่ต้องตรวจสอบ</p>
                </div>
                <StatusBadge variant="warning" label={`${approvalQueueCount} รายการ`} />
              </div>
            </div>

            <div className="rounded-2xl border border-sky-400/15 bg-gradient-to-br from-[#141a32] to-[#0f1528] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-white">อุปกรณ์ที่พร้อมใช้งาน</p>
                  <p className="mt-1 text-sm text-slate-400">ติดตามสถานะเครื่องและการซิงก์ข้อมูล</p>
                </div>
                <StatusBadge variant="success" label={`${onlineDeviceCount} เครื่อง`} />
              </div>
            </div>

            <EmptyState
              title="ข้อมูลเชิงลึกเพิ่มเติมจะแสดงที่นี่"
              description="เมื่อมีข้อมูลเพียงพอ ระบบจะแสดงแนวโน้มการมาสาย ภาระงานลา และคุณภาพการใช้งานอุปกรณ์"
            />
          </div>
        </SectionCard>
      </section>
    </div>
  )
}
