import { useQuery } from '@tanstack/react-query'
import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { getAdminDevices, type DeviceSummary } from '../../services/supabaseData'
import { queryKeys } from '../../store/queryKeys'

const fallbackStats = [
  { label: 'อุปกรณ์ทั้งหมด', value: '—' },
  { label: 'ยืนยันแล้ว', value: '—' },
  { label: 'ยังไม่ยืนยัน', value: '—' },
  { label: 'แพลตฟอร์ม', value: '—' },
]

export default function AdminDevicesPage() {
  const devicesQuery = useQuery({
    queryKey: queryKeys.admin.devices,
    queryFn: getAdminDevices,
  })

  const devices: DeviceSummary[] = devicesQuery.data?.data ?? []

  const deviceStats = devicesQuery.data
    ? [
        { label: 'อุปกรณ์ทั้งหมด', value: String(devices.length) },
        { label: 'ยืนยันแล้ว', value: String(devices.filter((device) => device.isVerified).length) },
        { label: 'ยังไม่ยืนยัน', value: String(devices.filter((device) => !device.isVerified).length) },
        { label: 'แพลตฟอร์ม', value: String(new Set(devices.map((device) => device.platform).filter(Boolean)).size) },
      ]
    : fallbackStats

  const isEmpty = !devicesQuery.isLoading && !devicesQuery.isError && devices.length === 0

  return (
    <div className="space-y-5">
      <SectionCard title="ภาพรวมอุปกรณ์" description="สรุปจำนวนอุปกรณ์ สถานะการยืนยัน และความหลากหลายของแพลตฟอร์ม">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {deviceStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="รายการอุปกรณ์"
        description="แสดงอุปกรณ์ที่ผูกกับผู้ใช้งานในรูปแบบการ์ดแนวนอน อ่านง่าย และตรวจสอบสถานะได้เร็ว"
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-sky-400" />
            ซิงก์แล้ว
          </div>
        }
      >
        {devicesQuery.isLoading ? (
          <EmptyState title="กำลังโหลดข้อมูลอุปกรณ์" description="ระบบกำลังดึงข้อมูลจาก Supabase" />
        ) : devicesQuery.isError ? (
          <EmptyState title="ไม่สามารถโหลดข้อมูลอุปกรณ์ได้" description="กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลแล้วลองใหม่อีกครั้ง" />
        ) : isEmpty ? (
          <EmptyState title="ยังไม่มีข้อมูลอุปกรณ์" description="เมื่อมีการเชื่อมอุปกรณ์ ข้อมูลจะปรากฏในส่วนนี้" />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {devices.map((device) => (
              <div key={device.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold tracking-tight text-white">{device.deviceName ?? 'ไม่ระบุชื่ออุปกรณ์'}</p>
                    <p className="mt-1 text-sm text-slate-300">{device.profileName ?? 'ยังไม่ผูกกับผู้ใช้งาน'}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">{device.platform ?? 'ไม่ระบุแพลตฟอร์ม'}</p>
                  </div>
                  <StatusBadge variant={device.isVerified ? 'success' : 'warning'} label={device.isVerified ? 'ยืนยันแล้ว' : 'รอยืนยัน'} />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">ผู้ใช้งาน</p>
                    <p className="mt-1 text-sm text-slate-200">{device.profileName ?? 'ยังไม่กำหนด'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">แพลตฟอร์ม</p>
                    <p className="mt-1 text-sm text-slate-200">{device.platform ?? '—'}</p>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-white/[0.03] p-3 sm:col-span-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">ใช้งานล่าสุด</p>
                    <p className="mt-1 text-sm text-slate-200">
                      {device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString('th-TH') : 'ยังไม่มีข้อมูล'}
                    </p>
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
