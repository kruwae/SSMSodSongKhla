import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'
import type { NotificationItem } from '../../types/app'

const notifications: NotificationItem[] = [
  { id: '1', title: 'New device approval', message: 'Branch Gate Phone is waiting for approval.', createdAt: '2026-04-12T08:20:00.000Z', read: false },
  { id: '2', title: 'Leave request submitted', message: 'Aree Samran submitted annual leave.', createdAt: '2026-04-12T07:48:00.000Z', read: true },
]

export default function AdminNotificationsPage(): JSX.Element {
  return (
    <SectionCard title="Notifications" description="Inbox for system events and approval actions.">
      <div className="space-y-3">
        {notifications.map((item) => (
          <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-medium text-slate-900">{item.title}</h3>
              <span className={`text-xs ${item.read ? 'text-slate-400' : 'text-sky-600'}`}>{item.read ? 'Read' : 'Unread'}</span>
            </div>
            <p className="mt-2 text-sm text-slate-600">{item.message}</p>
          </div>
        ))}
      </div>
      {notifications.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No notifications" description="System messages and workflow alerts will appear here." />
        </div>
      ) : null}
    </SectionCard>
  )
}