import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  ScanFace,
  ShieldCheck,
  Sparkles,
  TimerReset,
  Zap,
} from 'lucide-react'

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

function formatTime(value?: string | null): string {
  if (!value) return '—'
  const parts = value.split('T')
  return parts[1] ? parts[1].slice(0, 5) : value
}

function formatDate(value?: string | null): string {
  if (!value) return 'Today'
  return value.split('T')[0]
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
  const latestBadge = latestRow ? formatStatus(latestRow) : { label: 'No record', variant: 'neutral' as const }

  const summary = useMemo(
    () => ({
      thisMonth: rows.length > 0 ? `${rows.length}` : '—',
      averageHours:
        rows.length > 0
          ? `${(rows.reduce((total, row) => total + (typeof row.workHours === 'number' ? row.workHours : 0), 0) / rows.length).toFixed(1)}h`
          : '—',
      latestStatus: latestRow ? (latestRow.lateStatus ? 'Late' : latestRow.checkOutAt ? 'Present' : 'In progress') : '—',
      latestCheckIn: formatTime(latestRow?.checkInAt),
      latestCheckOut: formatTime(latestRow?.checkOutAt),
      latestDate: formatDate(latestRow?.checkInAt),
    }),
    [latestRow, rows],
  )

  const progressComplete = scanState === 'captured' && cameraReady && gpsReady

  return (
    <div className="space-y-5 pb-28">
      <SectionCard className="overflow-hidden p-0">
        <div className="bg-[linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] text-white">
          <div className="border-b border-white/10 bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-5 py-4 shadow-[0_16px_40px_rgba(37,99,235,0.22)] sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90">
                  <Sparkles className="h-3.5 w-3.5" />
                  Attendance
                </div>
                <h1 className="mt-3 text-2xl font-black tracking-[-0.04em] sm:text-3xl">ลงเวลาของฉัน</h1>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-white/75">
                  เช็กอินด้วยใบหน้าและ GPS พร้อมสรุปสถานะรายวันในรูปแบบแอปมือถือที่อ่านง่าย
                </p>
              </div>
              <div className="hidden rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-right md:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/60">Status</p>
                <p className="mt-1 text-lg font-semibold text-white">{summary.latestStatus}</p>
                <div className="mt-2">
                  <StatusBadge label={latestBadge.label} variant={latestBadge.variant} />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5 px-4 py-5 sm:px-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'This month', value: summary.thisMonth, hint: 'Records completed', icon: Clock3 },
                { label: 'Average hours', value: summary.averageHours, hint: 'Per working day', icon: TimerReset },
                { label: 'Latest check-in', value: summary.latestCheckIn, hint: summary.latestDate, icon: Zap },
                { label: 'Latest check-out', value: summary.latestCheckOut, hint: 'Most recent close', icon: CheckCircle2 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/6 p-4 shadow-[0_18px_50px_rgba(2,6,23,0.18)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">{item.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{item.value}</p>
                      <p className="mt-1 text-sm text-white/55">{item.hint}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white/90">
                      <item.icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
              <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.98))] p-4 shadow-[0_24px_70px_rgba(2,6,23,0.28)] sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">Face & GPS workflow</p>
                    <p className="mt-1 text-xs leading-5 text-white/60">
                      เปิดกล้อง ยืนยันใบหน้า แล้วล็อกตำแหน่งก่อนส่งรายการลงเวลา
                    </p>
                  </div>
                  <StatusBadge
                    label={progressComplete ? 'Ready' : 'In progress'}
                    variant={progressComplete ? 'success' : 'warning'}
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {[
                    { icon: Camera, label: 'Camera', value: cameraReady ? 'Permission granted' : 'Awaiting access' },
                    {
                      icon: ScanFace,
                      label: 'Face scan',
                      value: scanState === 'captured' ? 'Captured' : scanState === 'live' ? 'Live preview' : 'Stand by',
                    },
                    { icon: MapPin, label: 'GPS', value: gpsReady ? 'Location locked' : 'Waiting for fix' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white">
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{item.label}</p>
                          <p className="mt-1 text-xs text-white/55">{item.value}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(3,7,18,0.98))] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">Face capture</p>
                        <p className="mt-1 text-xs text-white/55">
                          {cameraReady ? 'Center your face in frame to capture proof.' : 'Grant camera access to start.'}
                        </p>
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

                    <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.22),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(3,7,18,0.98))] p-4">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.2rem] border border-dashed border-white/20">
                        <div className="absolute inset-0 grid place-items-center">
                          <div className="text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/8 text-white shadow-[0_0_0_14px_rgba(59,130,246,0.08)]">
                              <ScanFace className="h-10 w-10" />
                            </div>
                            <p className="mt-4 text-sm font-semibold text-white">
                              {scanState === 'captured' ? 'Face proof captured' : cameraReady ? 'Live scan preview active' : 'Camera not yet available'}
                            </p>
                            <p className="mt-1 text-xs text-white/55">
                              {cameraReady ? 'Keep your face inside the frame for a clean capture.' : 'Tap grant access to enable the camera.'}
                            </p>
                          </div>
                        </div>

                        <div className="absolute left-4 right-4 top-4 flex items-center justify-between text-[10px] uppercase tracking-[0.24em] text-white/55">
                          <span>Face frame</span>
                          <span>{scanState === 'captured' ? 'Captured' : scanState === 'live' ? 'Live' : 'Idle'}</span>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setScanState('live')}
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
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
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">GPS verification</p>
                          <p className="mt-1 text-xs text-white/55">Confirm your location before submitting attendance.</p>
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

                      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                                gpsReady ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/8 text-white/70'
                              }`}
                            >
                              <MapPin className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{gpsReady ? 'Location secured' : 'Waiting for GPS'}</p>
                              <p className="mt-1 text-xs text-white/55">
                                {gpsReady ? 'Latitude / longitude captured for proof.' : 'Enable location services to continue.'}
                              </p>
                            </div>
                          </div>
                          <StatusBadge label={gpsReady ? 'Locked' : 'Pending'} variant={gpsReady ? 'success' : 'neutral'} />
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Latitude</p>
                            <p className="mt-1 text-sm font-semibold text-white">{gpsReady ? '13.7563' : '—'}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Longitude</p>
                            <p className="mt-1 text-sm font-semibold text-white">{gpsReady ? '100.5018' : '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
                      <p className="text-sm font-semibold text-white">Quick checklist</p>
                      <p className="mt-1 text-xs text-white/55">Three steps before your attendance is ready to submit.</p>

                      <div className="mt-4 space-y-3">
                        {[
                          { label: 'Camera permission', done: cameraReady },
                          { label: 'Face proof captured', done: scanState === 'captured' },
                          { label: 'GPS locked', done: gpsReady },
                        ].map((step) => (
                          <div key={step.label} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/15 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-8 w-8 items-center justify-center rounded-xl ${
                                  step.done ? 'bg-emerald-400/15 text-emerald-200' : 'bg-white/8 text-white/45'
                                }`}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </span>
                              <p className="text-sm font-medium text-white">{step.label}</p>
                            </div>
                            <span className="text-xs uppercase tracking-[0.2em] text-white/45">{step.done ? 'Done' : 'Pending'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-4 shadow-[0_24px_70px_rgba(2,6,23,0.24)]">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">Monthly overview</p>
                      <p className="mt-1 text-xs text-white/55">A compact calendar-like summary for this period.</p>
                    </div>
                    <StatusBadge label={summary.latestStatus} variant={progressComplete ? 'success' : 'warning'} />
                  </div>

                  <div className="mt-4 grid grid-cols-7 gap-2 text-center">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                      <div key={day} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
                        {day}
                      </div>
                    ))}
                    {Array.from({ length: 28 }).map((_, index) => {
                      const active = index % 6 === 0 || index === 2 || index === 11
                      return (
                        <div
                          key={index}
                          className={`flex aspect-square items-center justify-center rounded-2xl border text-xs font-semibold ${
                            active
                              ? 'border-sky-400/25 bg-sky-400/15 text-sky-100'
                              : 'border-white/10 bg-white/[0.04] text-white/40'
                          }`}
                        >
                          {index + 1}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.95),rgba(2,6,23,0.98))] p-4 shadow-[0_24px_70px_rgba(2,6,23,0.24)]">
                  <p className="text-sm font-semibold text-white">Recent timeline</p>
                  <p className="mt-1 text-xs text-white/55">Latest in-out records with total duration.</p>

                  <div className="mt-4 space-y-3">
                    {rows.length > 0 ? (
                      rows.map((row, index) => {
                        const badge = formatStatus(row)
                        return (
                          <article
                            key={row.id}
                            className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-4 pl-5"
                          >
                            <div className="absolute left-2 top-5 h-2.5 w-2.5 rounded-full bg-sky-400 shadow-[0_0_0_6px_rgba(56,189,248,0.15)]" />
                            {index !== rows.length - 1 ? (
                              <div className="absolute bottom-[-14px] left-4 top-10 w-px bg-white/10" />
                            ) : null}

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-base font-semibold tracking-tight text-white">{formatDate(row.checkInAt)}</h3>
                                  <StatusBadge label={badge.label} variant={badge.variant} />
                                </div>
                                <p className="mt-1 text-sm text-white/55">
                                  In {formatTime(row.checkInAt)} · Out {formatTime(row.checkOutAt)}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 sm:min-w-[15rem]">
                                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/35">Hours</p>
                                  <p className="mt-1 text-sm font-semibold text-white">{formatHours(row.workHours)}</p>
                                </div>
                                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-white/35">Status</p>
                                  <p className="mt-1 text-sm font-semibold text-white">
                                    {row.lateStatus ? 'Late' : row.checkOutAt ? 'Present' : 'In progress'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </article>
                        )
                      })
                    ) : (
                      <EmptyState
                        title="No attendance data"
                        description="Your attendance history will appear here once check-ins are recorded."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.2),rgba(2,6,23,0.92))] px-4 pb-4 pt-3 backdrop-blur-xl sm:px-6">
        <div className="mx-auto grid max-w-5xl gap-3 sm:grid-cols-3">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-4 py-3 font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.22)] transition hover:translate-y-[-1px]"
          >
            <Zap className="h-4 w-4" />
            Check in now
          </button>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/8 px-4 py-3 font-semibold text-white transition hover:bg-white/12"
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-semibold text-white transition hover:border-white/20 hover:bg-black/30"
          >
            <TimerReset className="h-4 w-4" />
            Reset session
          </button>
        </div>
      </div>
    </div>
  )
}