import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { DeviceSummary } from '../../types/app'

const devices: DeviceSummary[] = [
  { id: '1', name: 'Main Lobby Tablet', officeName: 'Head Office', status: 'approved', lastSeenAt: '2026-04-12T08:30:00.000Z' },
  { id: '2', name: 'Branch Gate Phone', officeName: 'Branch Office', status: 'pending', lastSeenAt: null },
]

const deviceStats = [
  { label: 'Devices', value: '2' },
  { label: 'Approved', value: '1' },
  { label: 'Pending', value: '1' },
  { label: 'Offline', value: '1' },
]

export default function AdminDevicesPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard title="Device approvals" description="Manage capture devices, connectivity, and access readiness.">
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
        title="Devices"
        description="Approve capture devices and monitor connectivity from the queue."
        actions={
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            Approval queue
          </div>
        }
      >
        <div className="space-y-3">
          {devices.map((device) => (
            <div
              key={device.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-4 shadow-[0_12px_30px_rgba(6,8,20,0.22)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Capture device</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{device.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{device.officeName}</p>
                </div>
                <div className="text-left sm:text-right">
                  <StatusBadge
                    variant={device.status === 'approved' ? 'success' : device.status === 'pending' ? 'warning' : 'danger'}
                    label={device.status}
                  />
                  <p className="mt-2 text-xs text-slate-400">
                    {device.lastSeenAt ? `Last seen ${new Date(device.lastSeenAt).toLocaleString()}` : 'Never seen online'}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {devices.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No devices yet" description="Registered check-in devices and approvals will appear here." />
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}