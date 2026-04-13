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
    <div className="app-shell app-shell--employee">
      <AppSidebar
        title="Employee Portal"
        items={employeeNavItems}
        footer="Clock in, manage leave, and update your profile with ease."
      />
      <div className="app-shell__content app-shell__content--employee">
        <AppHeader
          title="Employee Portal"
          subtitle="A mobile-style workspace for attendance, leave, and profile tasks."
        />
        <main className="app-main app-main--employee">
          <div className="section-shell section-shell--employee">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}