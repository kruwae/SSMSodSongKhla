import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import type { DeviceSummary } from '../../types/app'

const devices: DeviceSummary[] = [
  { id: '1', name: 'Main Lobby Tablet', officeName: 'Head Office', status: 'approved', lastSeenAt: '2026-04-12T08:30:00.000Z' },
  { id: '2', name: 'Branch Gate Phone', officeName: 'Branch Office', status: 'pending', lastSeenAt: null },
]

export default function AdminDevicesPage(): JSX.Element {
  return (
    <SectionCard title="Devices" description="Approve capture devices and monitor connectivity.">
      <div className="space-y-3">
        {devices.map((device) => (
          <div key={device.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
            <div>
              <h3 className="font-medium text-slate-900">{device.name}</h3>
              <p className="text-sm text-slate-500">{device.officeName}</p>
            </div>
            <div className="text-right">
              <StatusBadge
                status={device.status === 'approved' ? 'success' : device.status === 'pending' ? 'warning' : 'danger'}
                label={device.status}
              />
              <p className="mt-2 text-xs text-slate-500">{device.lastSeenAt ? `Last seen ${device.lastSeenAt}` : 'Never seen'}</p>
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
  )
}