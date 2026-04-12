import { Outlet } from 'react-router-dom'
import { AppHeader } from '../components/AppHeader'
import { AppSidebar } from '../components/AppSidebar'
import type { NavigationItem } from '../types/app'

const employeeNavItems: NavigationItem[] = [
  { label: 'Home', href: '/employee' },
  { label: 'Attendance', href: '/employee/attendance' },
  { label: 'Leave', href: '/employee/leave' },
  { label: 'Profile', href: '/employee/profile' },
]

export default function EmployeeLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-[280px_minmax(0,1fr)]">
      <AppSidebar title="Employee Portal" items={employeeNavItems} footer="Clock in, manage leave, and update your profile" />
      <div className="flex min-h-screen flex-col bg-slate-50">
        <AppHeader title="Employee Portal" subtitle="Access attendance and leave tools from one place" />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}