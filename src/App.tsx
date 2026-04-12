import { Navigate, Route, Routes } from 'react-router-dom'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import AdminLayout from './layouts/AdminLayout'
import EmployeeLayout from './layouts/EmployeeLayout'
import LoginPage from './pages/LoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminOfficesPage from './pages/admin/AdminOfficesPage'
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage'
import AdminDevicesPage from './pages/admin/AdminDevicesPage'
import AdminAttendancePage from './pages/admin/AdminAttendancePage'
import AdminLeavesPage from './pages/admin/AdminLeavesPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import EmployeeHomePage from './pages/employee/EmployeeHomePage'
import EmployeeAttendancePage from './pages/employee/EmployeeAttendancePage'
import EmployeeLeavePage from './pages/employee/EmployeeLeavePage'
import EmployeeProfilePage from './pages/employee/EmployeeProfilePage'

export default function App() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="offices" element={<AdminOfficesPage />} />
          <Route path="employees" element={<AdminEmployeesPage />} />
          <Route path="devices" element={<AdminDevicesPage />} />
          <Route path="attendance" element={<AdminAttendancePage />} />
          <Route path="leaves" element={<AdminLeavesPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
        </Route>
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<EmployeeHomePage />} />
          <Route path="attendance" element={<EmployeeAttendancePage />} />
          <Route path="leave" element={<EmployeeLeavePage />} />
          <Route path="profile" element={<EmployeeProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AppErrorBoundary>
  )
}
