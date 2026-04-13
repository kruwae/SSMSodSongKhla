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
    <section
      className={cn(
        'section-card surface-panel surface-panel--interactive overflow-hidden border border-white/8 p-4 shadow-[0_16px_40px_rgba(6,8,20,0.24)] sm:p-5 lg:p-6',
        className,
      )}
    >
      {(title || description || actions) && (
        <div className="mb-4 flex flex-col gap-3 border-b border-white/8 pb-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <div className="flex items-center gap-2">
                <span className="section-card__accent h-2.5 w-2.5 rounded-full bg-[hsl(var(--ring))] shadow-[0_0_0_4px_rgba(250,204,21,0.12)]" />
                <h2 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h2>
              </div>
            ) : null}
            {description ? (
              <p className="mt-1.5 max-w-3xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>
            ) : null}
          </div>
          {actions ? <div className="section-card__actions flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
        </div>
      )}
      <div className="section-card__body">{children}</div>
    </section>
  )
}

export default SectionCard