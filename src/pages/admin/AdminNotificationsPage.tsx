import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import type { NotificationItem } from '../../types/app'

const notifications: NotificationItem[] = [
  { id: '1', title: 'New device approval', message: 'Branch Gate Phone is waiting for approval.', createdAt: '2026-04-12T08:20:00.000Z', read: false },
  { id: '2', title: 'Leave request submitted', message: 'Aree Samran submitted annual leave.', createdAt: '2026-04-12T07:48:00.000Z', read: true },
]

const notificationStats = [
  { label: 'Total', value: '2' },
  { label: 'Unread', value: '1' },
  { label: 'Approvals', value: '1' },
  { label: 'Updates', value: '1' },
]

export default function AdminNotificationsPage(): JSX.Element {
  return (
    <div className="space-y-6">
      <SectionCard title="Notification center" description="System messages, approval alerts, and workflow updates in one view.">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {notificationStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Notifications"
        description="Inbox for system events and approval actions."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Priority feed
          </div>
        }
      >
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-4 shadow-[0_12px_30px_rgba(6,8,20,0.22)]"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Alert</p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-white">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.message}</p>
                </div>
                <div className="text-left sm:text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset shadow-sm backdrop-blur-sm ${
                      item.read
                        ? 'bg-slate-500/10 text-slate-300 ring-slate-400/20'
                        : 'bg-sky-500/10 text-sky-200 ring-sky-400/20'
                    }`}
                  >
                    {item.read ? 'Read' : 'Unread'}
                  </span>
                  <p className="mt-2 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        {notifications.length === 0 ? (
          <div className="mt-4">
            <EmptyState title="No notifications" description="System messages and workflow alerts will appear here." />
          </div>
        ) : null}
      </SectionCard>
    </div>
  )
}