import type { ReactNode } from 'react'

type Props = {
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: Props) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-[linear-gradient(180deg,rgba(18,24,46,0.78),rgba(12,16,34,0.7))] p-6 text-center shadow-[0_20px_50px_rgba(6,8,20,0.22)] sm:p-8">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-[hsla(var(--ring),0.18)] bg-[hsla(var(--ring),0.08)] text-[#fde68a] shadow-[0_0_0_6px_rgba(250,204,21,0.06)]">
        <span className="h-3 w-3 rounded-full bg-[hsl(var(--ring))]" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-[hsl(var(--foreground))]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{description}</p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  )
}

export default EmptyState