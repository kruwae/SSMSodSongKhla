import { cn } from '../lib/utils'

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'gold'

type Props = {
  label: string
  variant?: StatusBadgeVariant
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  success:
    'border-emerald-400/20 bg-emerald-500/10 text-emerald-200 shadow-[0_0_0_1px_rgba(52,211,153,0.08)]',
  warning:
    'border-amber-400/20 bg-amber-500/10 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.08)]',
  danger: 'border-rose-400/20 bg-rose-500/10 text-rose-200 shadow-[0_0_0_1px_rgba(251,113,133,0.08)]',
  info: 'border-sky-400/20 bg-sky-500/10 text-sky-200 shadow-[0_0_0_1px_rgba(56,189,248,0.08)]',
  neutral:
    'border-slate-400/20 bg-slate-500/10 text-slate-200 shadow-[0_0_0_1px_rgba(148,163,184,0.08)]',
  gold:
    'border-[hsla(var(--ring),0.3)] bg-[hsla(var(--ring),0.12)] text-[#fde68a] shadow-[0_0_0_1px_rgba(250,204,21,0.12)]',
}

export function StatusBadge({ label, variant = 'neutral' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide ring-1 ring-inset backdrop-blur-sm',
        variantClasses[variant],
      )}
    >
      {label}
    </span>
  )
}

export default StatusBadge