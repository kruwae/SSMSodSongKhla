import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import type { OfficeSummary } from '../../types/app'

const offices: OfficeSummary[] = [
  { id: '1', name: 'Head Office', address: 'Songkhla, Thailand', latitude: 7.189, longitude: 100.595, employeeCount: 84 },
  { id: '2', name: 'Branch Office', address: 'Hat Yai, Thailand', latitude: 7.008, longitude: 100.474, employeeCount: 26 },
]

const officeStats = [
  { label: 'Offices', value: '2' },
  { label: 'Employees', value: '110' },
  { label: 'Geofences', value: '2' },
  { label: 'Coverage', value: '98%' },
]

export default function AdminOfficesPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard
        title="Office coverage"
        description="Track office locations, geofences, and staffing across your attendance network."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {officeStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Office map"
        description="Map integration placeholder for office coverage, geofencing, and location awareness."
        actions={
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
            Live coverage preview
          </div>
        }
      >
        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-gradient-to-br from-slate-950/60 to-slate-900/40 text-center">
          <div>
            <div className="mx-auto mb-3 h-12 w-12 rounded-2xl border border-amber-400/20 bg-amber-400/10" />
            <p className="text-sm font-medium text-slate-200">Map component placeholder</p>
            <p className="mt-1 text-sm text-slate-400">Geofences, coordinates, and site coverage will render here.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Office list"
        description="Manage office metadata, coordinates, and staffing from a single view."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Synced
          </div>
        }
      >
        <div className="space-y-3">
          {offices.map((office) => (
            <div
              key={office.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-4 shadow-[0_12px_30px_rgba(6,8,20,0.22)]"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Office</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{office.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{office.address}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Coordinates: {office.latitude.toFixed(3)}, {office.longitude.toFixed(3)}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">Staffed</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{office.employeeCount}</p>
                  <p className="text-xs text-amber-100/70">employees</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {offices.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No offices yet"
              description="Create your first office to begin assigning employees, devices, and geofence rules."
            />
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}