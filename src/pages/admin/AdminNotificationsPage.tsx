import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminNotifications, type NotificationSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'แจ้งเตือนทั้งหมด', value: '—' },
  { label: 'ยังไม่อ่าน', value: '—' },
  { label: 'อ่านแล้ว', value: '—' },
  { label: 'ประเภท', value: '—' },
]

export default function AdminNotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: queryKeys.admin.notifications,
    queryFn: getAdminNotifications,
  })

  const notifications: NotificationSummary[] = notificationsQuery.data?.data ?? []

  const notificationStats = notificationsQuery.data
    ? [
        { label: 'แจ้งเตือนทั้งหมด', value: String(notifications.length) },
        { label: 'ยังไม่อ่าน', value: String(notifications.filter((item) => !item.isRead).length) },
        { label: 'อ่านแล้ว', value: String(notifications.filter((item) => item.isRead).length) },
        { label: 'ประเภท', value: String(new Set(notifications.map((item) => item.category).filter(Boolean)).size) },
      ]
    : fallbackStats

  const isEmpty = !notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length === 0

  const getCategoryLabel = (category: NotificationSummary['category']) => {
    if (category === 'attendance') return 'การลงเวลา'
    if (category === 'leave') return 'การลา'
    if (category === 'device') return 'อุปกรณ์'
    if (category === 'admin') return 'ผู้ดูแลระบบ'
    return 'ระบบ'
  }

  return (
    <div className="space-y-5">
      <SectionCard title="ภาพรวมการแจ้งเตือน" description="สรุปจำนวนการแจ้งเตือน สถานะการอ่าน และหมวดหมู่ที่ใช้งานในระบบ">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {notificationStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="รายการแจ้งเตือน"
        description="เปลี่ยนเป็นการ์ด div เรียงแนวนอน ช่วยให้ดูหัวข้อ เนื้อหา และสถานะได้สั้นและชัดขึ้น"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            ข้อมูลสด
          </div>
        }
      >
        {notificationsQuery.isLoading ? (
          <EmptyState title="กำลังโหลดการแจ้งเตือน" description="ระบบกำลังดึงข้อมูลจาก Supabase" />
        ) : notificationsQuery.isError ? (
          <EmptyState title="ไม่สามารถโหลดการแจ้งเตือนได้" description="กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลแล้วลองใหม่อีกครั้ง" />
        ) : isEmpty ? (
          <EmptyState title="ยังไม่มีการแจ้งเตือน" description="เมื่อระบบมีการแจ้งเตือน ข้อมูลจะปรากฏในส่วนนี้" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold tracking-tight text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-300">{getCategoryLabel(item.category)}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                      {item.sentAt ? new Date(item.sentAt).toLocaleString('th-TH') : 'ยังไม่ระบุเวลา'}
                    </p>
                  </div>
                  <StatusBadge variant={item.isRead ? 'neutral' : 'warning'} label={item.isRead ? 'อ่านแล้ว' : 'ยังไม่อ่าน'} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">รายละเอียด</p>
                    <p className="mt-1 text-sm text-slate-200">{item.body}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 sm:col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">ลิงก์ปลายทาง</p>
                    <p className="mt-1 text-sm text-slate-200">{item.actionUrl ?? '—'}</p>
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