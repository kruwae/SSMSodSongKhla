import type { ReactNode } from 'react'
import { cn } from '../lib/utils'

type Props = {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ title, description, actions, children, className }: Props) {
  return (
    <section className={cn('surface-panel surface-panel--interactive overflow-hidden p-5 sm:p-6', className)}>
      {(title || description || actions) && (
        <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-200/70 pb-4">
          <div className="min-w-0">
            {title ? <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p> : null}
          </div>
          {actions}
        </div>
      )}
      {children}
    </section>
  )
}

export default SectionCard