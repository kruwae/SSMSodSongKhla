import type { ReactNode } from 'react'

type Props = {
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function AppHeader({ title, subtitle, actions }: Props) {
  return (
    <header className="app-header">
      <div className="app-header__body">
        <p className="app-header__eyebrow">attendance platform</p>
        <h1 className="app-header__title">{title}</h1>
        {subtitle ? <p className="app-header__subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="app-header__actions">{actions}</div> : null}
    </header>
  )
}