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
    <aside className="flex h-full flex-col border-r border-slate-200 bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">attendance</p>
        <h1 className="mt-2 text-xl font-semibold">{title}</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/admin' || item.href === '/employee'}
            className={({ isActive }) =>
              cn(
                'flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-sky-500/15 text-sky-300' : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      {footer ? <div className="border-t border-slate-800 px-6 py-4 text-xs text-slate-400">{footer}</div> : null}
    </aside>
  )
}