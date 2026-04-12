import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../features/auth/AuthProvider'
import SectionCard from '../components/SectionCard'

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [identifier, setIdentifier] = useState('admin@attendance.local')
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md">
        <SectionCard title="Sign in" description="Use your attendance account to continue.">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Email or employee ID</span>
              <input
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-900"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none ring-0 focus:border-slate-900"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </SectionCard>
      </div>
    </div>
  )
}