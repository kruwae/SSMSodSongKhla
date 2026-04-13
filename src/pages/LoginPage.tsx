import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import SectionCard from '../components/SectionCard'
import { useAuth } from '../features/auth/AuthProvider'

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const { signIn, user } = useAuth()
  const [identifier, setIdentifier] = useState(user?.email ?? 'admin@attendance.local')
  const [password, setPassword] = useState('password')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault()
    setIsSubmitting(true)
    await signIn(identifier, password)
    setIsSubmitting(false)
    navigate(identifier.includes('admin') ? '/admin' : '/employee', { replace: true })
  }

  return (
    <div className="page-frame flex min-h-screen items-center justify-center px-4 py-8">
      <div className="section-shell grid w-full gap-6 lg:grid-cols-[1.05fr_minmax(0,420px)] lg:items-center lg:gap-8">
        <section className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[hsla(var(--ring),0.2)] bg-[hsla(var(--ring),0.08)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#fde68a]">
            Attendance HQ
          </div>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-black tracking-[-0.04em] text-[hsl(var(--foreground))] sm:text-5xl">
              Premium attendance, designed for every shift.
            </h1>
            <p className="max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">
              Sign in to access your daily workflow, review attendance status, and stay connected to office operations
              with a polished, mobile-ready experience.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Fast check-ins', value: '1 tap' },
              { label: 'Live status', value: 'Always on' },
              { label: 'Shift aware', value: 'Auto updates' },
            ].map((item) => (
              <div key={item.label} className="surface-panel border border-white/8 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                  {item.label}
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[#fde68a]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionCard
          title="Sign in"
          description="Use your attendance account to continue."
          className="shadow-[0_28px_70px_rgba(6,8,20,0.34)]"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[hsl(var(--foreground))]">
                Email or employee ID
              </span>
              <input
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))]/70 focus:border-[hsla(var(--ring),0.45)] focus:bg-white/7"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-[hsl(var(--foreground))]">Password</span>
              <input
                type="password"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-[hsl(var(--foreground))] outline-none transition placeholder:text-[hsl(var(--muted-foreground))]/70 focus:border-[hsla(var(--ring),0.45)] focus:bg-white/7"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,hsl(var(--primary)),#4f46e5)] px-4 py-3 font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_16px_30px_rgba(79,70,229,0.26)] transition hover:translate-y-[-1px] hover:shadow-[0_18px_36px_rgba(79,70,229,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}