import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import type { OfficeSummary } from '../../types/app'

const offices: OfficeSummary[] = [
  { id: '1', name: 'Head Office', address: 'Songkhla, Thailand', latitude: 7.189, longitude: 100.595, employeeCount: 84 },
  { id: '2', name: 'Branch Office', address: 'Hat Yai, Thailand', latitude: 7.008, longitude: 100.474, employeeCount: 26 },
]

export default function AdminOfficesPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard title="Office map" description="Map integration placeholder for office coverage and geofencing.">
        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-500">
          Map component placeholder
        </div>
      </SectionCard>

      <SectionCard title="Office list" description="Manage office metadata, coordinates, and staffing.">
        <div className="space-y-3">
          {offices.map((office) => (
            <div key={office.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-slate-900">{office.name}</h3>
                  <p className="text-sm text-slate-500">{office.address}</p>
                </div>
                <p className="text-sm text-slate-500">{office.employeeCount} employees</p>
              </div>
            </div>
          ))}
        </div>
        {offices.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No offices yet" description="Create your first office to begin assigning employees and devices." />
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}