import { cn } from '../lib/utils'

type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

type Props = {
  label: string
  variant?: StatusBadgeVariant
}

const variantClasses: Record<StatusBadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 ring-amber-200/80',
  danger: 'bg-red-50 text-red-700 ring-red-200/80',
  info: 'bg-sky-50 text-sky-700 ring-sky-200/80',
  neutral: 'bg-slate-100 text-slate-700 ring-slate-200/80',
}

export function StatusBadge({ label, variant = 'neutral' }: Props) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset shadow-sm',
        variantClasses[variant],
      )}
    >
      {label}
    </span>
  )
}

export default StatusBadge