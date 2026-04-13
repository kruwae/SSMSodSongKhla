import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Camera, CheckCircle2, Clock3, MapPin, ScanFace, ShieldCheck, Sparkles, TimerReset, Zap } from 'lucide-react'

import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../features/auth/AuthProvider'
import { getEmployeeAttendanceRecords, type AttendanceSummary } from '../../services/supabaseData'

const statusLabels: Record<string, { label: string; variant: 'success' | 'warning' | 'neutral' }> = {
  present: { label: 'Present', variant: 'success' },
  late: { label: 'Late', variant: 'warning' },
  absent: { label: 'Absent', variant: 'neutral' },
}

type EmployeeAttendanceData = Awaited<ReturnType<typeof getEmployeeAttendanceRecords>>['data']

function formatStatus(row: AttendanceSummary): { label: string; variant: 'success' | 'warning' | 'neutral' } {
  if (row.lateStatus) return statusLabels.late
  if (row.checkOutAt) return statusLabels.present
  return statusLabels.absent
}

function formatHours(value: AttendanceSummary['workHours']): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return `${value.toFixed(1)}h`
  }
  return '—'
}

export default function EmployeeAttendancePage(): JSX.Element {
  const { session, user } = useAuth()
  const profileId = session?.userId ?? user?.id ?? null
  const [cameraReady, setCameraReady] = useState(false)
  const [gpsReady, setGpsReady] = useState(false)
  const [scanState, setScanState] = useState<'idle' | 'live' | 'captured'>('idle')

  const { data } = useQuery({
    queryKey: ['employee-attendance', profileId ?? 'anonymous'],
    queryFn: () => getEmployeeAttendanceRecords(profileId),
    enabled: Boolean(profileId),
  })

  const rows: EmployeeAttendanceData = data?.data ?? []

  const latestRow = rows[0]
  const latestCheckIn = latestRow?.checkInAt ?? '—'

  const summary = useMemo(
    () => ({
      thisMonth: rows.length > 0 ? `${rows.length}` : '—',
      averageHours:
        rows.length > 0
          ? `${(rows.reduce((total, row) => total + (typeof row.workHours === 'number' ? row.workHours : 0), 0) / rows.length).toFixed(1)}h`
          : '—',
      latestStatus: latestRow ? (latestRow.lateStatus ? 'Late' : latestRow.checkOutAt ? 'Present' : 'In progress') : '—',
      latestCheckIn,
    }),
    [latestCheckIn, latestRow, rows],
  )

  const latestBadge = latestRow ? formatStatus(latestRow) : { label: 'No record', variant: 'neutral' as const }

  return (
    <div className="space-y-5">
      <SectionCard
        title="ลงเวลาของฉัน"
        description="ประสบการณ์เช็กอินและเช็กเอาต์แบบพรีเมียม พร้อมยืนยันใบหน้าและตำแหน่งสำหรับทุกกะ"
        className="overflow-hidden"
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
          <div className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.14),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(8,12,25,0.96))] p-5 shadow-[0_24px_80px_rgba(3,7,18,0.35)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100">
                  <Sparkles className="h-3.5 w-3.5" />
                  Premium attendance flow
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
                  Ready for a secure check-in?
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Confirm camera access, capture face proof, and verify GPS before submitting your attendance action.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Current status</p>
                <p className="mt-1 text-lg font-semibold text-white">{summary.latestStatus}</p>
                <div className="mt-2">
                  <StatusBadge label={latestBadge.label} variant={latestBadge.variant} />
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Camera, label: 'Camera', value: cameraReady ? 'Permission granted' : 'Awaiting access' },
                { icon: ScanFace, label: 'Face scan', value: scanState === 'captured' ? 'Captured' : scanState === 'live' ? 'Live preview' : 'Stand by' },
                { icon: MapPin, label: 'GPS', value: gpsReady ? 'Location locked' : 'Waiting for fix' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-amber-200">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.12fr_minmax(0,0.88fr)]">
              <div className="rounded-3xl border border-white/10 bg-slate-950/55 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Camera permission</p>
                    <p className="mt-1 text-xs text-slate-400">Allow camera to enable face-scan proof for attendance.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCameraReady(true)}
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/15"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Grant access
                  </button>
                </div>

                <div className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.92))] p-4">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(250,204,21,0.22),transparent_55%),linear-gradient(180deg,rgba(15,23,42,0.95),rgba(3,7,18,0.98))]">
                    <div className="absolute inset-0 grid place-items-center">
                      <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-amber-200 shadow-[0_0_0_12px_rgba(250,204,21,0.08)]">
                          <ScanFace className="h-10 w-10" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-white">
                          {scanState === 'captured' ? 'Face proof captured' : cameraReady ? 'Live scan preview active' : 'Camera not yet available'}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {cameraReady ? 'Center your face within the frame for a clear capture.' : 'Tap “Grant access” to enable the camera.'}
                        </p>
                      </div>
                    </div>

                    <div className="absolute inset-4 rounded-[1.5rem] border border-dashed border-amber-300/30" />
                    <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-slate-400">
                      <span>Face frame</span>
                      <span>{scanState === 'captured' ? 'Captured' : scanState === 'live' ? 'Live' : 'Idle'}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setScanState('live')}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        Start scan
                      </button>
                      <button
                        type="button"
                        onClick={() => setScanState('captured')}
                        className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-3 py-2 text-xs font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Capture proof
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">GPS verification</p>
                      <p className="mt-1 text-xs text-slate-400">Confirm your location before submitting attendance.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setGpsReady(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-400/15"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Lock location
                    </button>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${gpsReady ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/5 text-slate-300'}`}>
                          <MapPin className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{gpsReady ? 'Location secured' : 'Waiting for GPS'}</p>
                          <p className="mt-1 text-xs text-slate-400">{gpsReady ? 'Latitude / longitude captured for proof.' : 'Enable location services to continue.'}</p>
                        </div>
                      </div>
                      <StatusBadge label={gpsReady ? 'Locked' : 'Pending'} variant={gpsReady ? 'success' : 'neutral'} />
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Latitude</p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{gpsReady ? '13.7563' : '—'}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-3">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Longitude</p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{gpsReady ? '100.5018' : '—'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,12,25,0.92))] p-4">
                  <p className="text-sm font-semibold text-white">Submission actions</p>
                  <p className="mt-1 text-xs text-slate-400">Use the actions below to complete the attendance flow.</p>

                  <div className="mt-4 grid gap-3">
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-4 py-3 font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]"
                    >
                      <Zap className="h-4 w-4" />
                      Check in now
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-semibold text-white transition hover:bg-white/10"
                    >
                      <Clock3 className="h-4 w-4" />
                      Check out now
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraReady(false)
                        setGpsReady(false)
                        setScanState('idle')
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 font-semibold text-slate-200 transition hover:border-white/20 hover:bg-slate-950/70"
                    >
                      <TimerReset className="h-4 w-4" />
                      Reset session
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">This month</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{summary.thisMonth}</p>
                <p className="mt-1 text-sm text-slate-400">Completed on schedule</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Average hours</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{summary.averageHours}</p>
                <p className="mt-1 text-sm text-slate-400">Per working day</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Latest check-in</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{summary.latestCheckIn}</p>
                <p className="mt-1 text-sm text-slate-400">Recorded from your device</p>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-950/45 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Live progress</p>
                  <p className="mt-1 text-xs text-slate-400">A quick checklist before submission.</p>
                </div>
                <StatusBadge label={scanState === 'captured' && cameraReady && gpsReady ? 'Ready' : 'In progress'} variant={scanState === 'captured' && cameraReady && gpsReady ? 'success' : 'warning'} />
              </div>

              <div className="mt-4 space-y-3">
                {[
                  { label: 'Camera permission', done: cameraReady },
                  { label: 'Face proof captured', done: scanState === 'captured' },
                  { label: 'GPS locked', done: gpsReady },
                ].map((step) => (
                  <div key={step.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${step.done ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/5 text-slate-400'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                      <p className="text-sm font-medium text-white">{step.label}</p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-400">{step.done ? 'Done' : 'Pending'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Recent records"
        description="Review your latest attendance entries and total hours."
        actions={
          <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
            Updated today
          </div>
        }
      >
        {rows.length > 0 ? (
          <div className="space-y-3">
            {rows.map((row) => {
              const badge = formatStatus(row)

              return (
                <article
                  key={row.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400/30 hover:bg-white/[0.07]"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold tracking-tight text-white">
                          {row.checkInAt.split('T')[0]}
                        </h3>
                        <StatusBadge label={badge.label} variant={badge.variant} />
                      </div>
                      <p className="mt-1 text-sm text-slate-400">
                        Check-in {row.checkInAt} · Check-out {row.checkOutAt ?? '—'}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:min-w-[16rem]">
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Hours
                        </p>
                        <p className="mt-1 text-sm font-semibold text-slate-100">{formatHours(row.workHours)}</p>
                      </div>
                      <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-2">
                        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
                          Status
                        </p>
                        <p className="mt-1 text-sm font-semibold capitalize text-slate-100">
                          {row.lateStatus ? 'Late' : row.checkOutAt ? 'Present' : 'In progress'}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No attendance data"
            description="Your attendance history will appear here once check-ins are recorded."
          />
        )}
      </SectionCard>
    </div>
  )
}