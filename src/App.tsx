import { useMemo, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import RoleNav from './components/RoleNav'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminDevicesPage from './pages/admin/AdminDevicesPage'
import AdminLocationsPage from './pages/admin/AdminLocationsPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import UserCheckInPage from './pages/user/UserCheckInPage'
import UserDashboardPage from './pages/user/UserDashboardPage'
import UserHistoryPage from './pages/user/UserHistoryPage'
import './App.css'

type AppRole = 'user' | 'admin'

export function ProtectedRoute({ role }: { role: AppRole }) {
  const location = useLocation()
  const pathname = location.pathname

  if (role === 'user' && !pathname.startsWith('/user')) {
    return <Navigate to="/user" replace />
  }

  if (role === 'admin' && !pathname.startsWith('/admin')) {
    return <Navigate to="/admin" replace />
  }

  return <Outlet />
}

function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="index-page">
      <main className="main-content">
        <section className="panel summary-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Login</p>
              <h3>เลือกการใช้งาน</h3>
            </div>
          </div>
          <div className="panel-actions">
            <button type="button" className="primary-button" onClick={() => navigate('/user')}>
              เข้าสู่ระบบผู้ใช้งาน
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate('/admin')}>
              เข้าสู่ระบบผู้ดูแลระบบ
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function RouteShell({ role }: { role: AppRole }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isAdmin = role === 'admin'
  const today = useMemo(() => {
    return new Date().toLocaleDateString('th-TH', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }, [])

  return (
    <div className={`index-page${sidebarOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-mark">SSM</div>
          <div>
            <h1>Attendance</h1>
            <p>{isAdmin ? 'ระบบผู้ดูแล' : 'ระบบผู้ใช้งาน'}</p>
          </div>
        </div>

        <RoleNav
          mode={isAdmin ? 'admin' : 'user'}
          activePath={location.pathname}
          onNavigate={() => undefined}
        />

        <div className="sidebar-card">
          <p className="sidebar-card-label">สถานะระบบ</p>
          <strong>{isAdmin ? 'Admin mode' : 'User mode'}</strong>
          <span>{today}</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            aria-label={sidebarOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            ☰
          </button>
          <div>
            <p className="eyebrow">{isAdmin ? 'Admin Routing' : 'User Routing'}</p>
            <h2>{isAdmin ? 'หน้าผู้ดูแลระบบ' : 'หน้าผู้ใช้งาน'}</h2>
          </div>
          <div className="topbar-meta">
            <span>{today}</span>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}


function App() {
  return <AppRoutes />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute role="user" />}>
        <Route path="/user" element={<RouteShell role="user" />}>
          <Route index element={<UserDashboardPage />} />
          <Route path="check-in" element={<UserCheckInPage />} />
          <Route path="history" element={<UserHistoryPage />} />
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute role="admin" />}>
        <Route path="/admin" element={<RouteShell role="admin" />}>
          <Route index element={<AdminDashboardPage today={new Date().toLocaleDateString('th-TH', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })} />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="devices" element={<AdminDevicesPage />} />
          <Route path="locations" element={<AdminLocationsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
