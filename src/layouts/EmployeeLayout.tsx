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
    <div className="app-shell">
      <AppSidebar
        title="Employee Portal"
        items={employeeNavItems}
        footer="Clock in, manage leave, and update your profile with ease."
      />
      <div className="app-shell__content">
        <AppHeader
          title="Employee Portal"
          subtitle="Access attendance and leave tools from a polished workspace built for daily use."
        />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}