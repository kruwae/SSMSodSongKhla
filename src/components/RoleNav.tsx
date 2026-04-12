import type { ReactNode } from 'react'

export type RoleNavMode = 'admin' | 'user'

export type RoleNavItem = {
  label: string
  href: string
  end?: boolean
  icon?: ReactNode
}

type RoleNavProps = {
  mode: RoleNavMode
  className?: string
  onNavigate?: () => void
  activePath?: string
}

const navItems: Record<RoleNavMode, RoleNavItem[]> = {
  admin: [
    { label: 'แดชบอร์ด', href: '/admin', end: true },
    { label: 'ผู้ใช้งาน', href: '/admin/users' },
    { label: 'อุปกรณ์', href: '/admin/devices' },
    { label: 'สถานที่', href: '/admin/locations' },
  ],
  user: [
    { label: 'แดชบอร์ด', href: '/user', end: true },
    { label: 'ลงชื่อเข้าใช้', href: '/user/check-in' },
    { label: 'ประวัติ', href: '/user/history' },
  ],
}

function isActivePath(currentPath: string | undefined, item: RoleNavItem) {
  if (!currentPath) return false
  if (item.end) return currentPath === item.href
  return currentPath === item.href || currentPath.startsWith(`${item.href}/`)
}

function RoleNav({ mode, className = '', onNavigate, activePath }: RoleNavProps) {
  const items = navItems[mode]

  return (
    <nav className={`sidebar-nav ${className}`.trim()}>
      {items.map((item) => {
        const active = isActivePath(activePath, item)

        return (
          <a
            key={item.href}
            href={item.href}
            className={`nav-item ${active ? 'active' : ''}`.trim()}
            aria-current={active ? 'page' : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </a>
        )
      })}
    </nav>
  )
}

export default RoleNav