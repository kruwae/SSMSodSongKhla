import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AppSidebar } from '../components/AppSidebar'
import type { NavigationItem } from '../types/app'

const adminNavItems: NavigationItem[] = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Offices', href: '/admin/offices' },
  { label: 'Employees', href: '/admin/employees' },
  { label: 'Devices', href: '/admin/devices' },
  { label: 'Attendance', href: '/admin/attendance' },
  { label: 'Leaves', href: '/admin/leaves' },
  { label: 'Notifications', href: '/admin/notifications' },
]

export default function AdminLayout() {
  return (
    <div className="app-shell">
      <AppSidebar title="Admin Console" items={adminNavItems} footer="Manage offices, employees, and records" />
      <div className="app-shell__content">
        <AppHeader title="Admin Portal" subtitle="Operations, approval workflows, and attendance oversight" />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}