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
    <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
      <AppSidebar title="Admin Console" items={adminNavItems} footer="Manage offices, employees, and records" />
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader title="Admin Portal" subtitle="Operations, approval workflows, and attendance oversight" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}