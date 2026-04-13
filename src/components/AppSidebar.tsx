import { NavLink } from 'react-router-dom'
import type { NavigationItem } from '../types/app'
import { cn } from '../lib/utils'

type Props = {
  title: string
  items: NavigationItem[]
  footer?: string
}

export function AppSidebar({ title, items, footer }: Props) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <p className="app-sidebar__eyebrow">attendance platform</p>
        <h1 className="app-sidebar__title">{title}</h1>
        <p className="app-sidebar__description">A focused workspace for attendance, leaves, and team operations.</p>
      </div>

      <nav className="app-sidebar__nav" aria-label={`${title} navigation`}>
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/admin' || item.href === '/employee'}
            className={({ isActive }) =>
              cn('app-sidebar__link', isActive && 'app-sidebar__link--active')
            }
          >
            <span className="app-sidebar__link-dot" aria-hidden="true" />
            <span className="app-sidebar__link-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {footer ? <div className="app-sidebar__footer">{footer}</div> : null}
    </aside>
  )
}