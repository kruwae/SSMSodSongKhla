import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'

export default function EmployeeProfilePage(): JSX.Element {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Profile"
        description="Manage your employee information, security settings, and account preferences."
      >
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-sky-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
                EW
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Employee account</p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-white">Evelyn Wong</h3>
                <p className="mt-1 text-sm text-slate-400">Frontend Engineer · employee@company.com</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Full name</span>
                <input
                  type="text"
                  defaultValue="Evelyn Wong"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-400/40"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Email</span>
                <input
                  type="email"
                  defaultValue="employee@company.com"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-400/40"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Department</span>
                <input
                  type="text"
                  defaultValue="Engineering"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-400/40"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Role</span>
                <input
                  type="text"
                  defaultValue="Employee"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-400/40"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5">
                Cancel
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-105">
                Save changes
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Security</p>
              <div className="mt-3 space-y-3 text-sm">
                <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3">
                  <span className="block font-medium text-white">Password</span>
                  <span className="mt-1 block text-slate-400">Last updated 18 days ago</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3">
                  <span className="block font-medium text-white">Two-factor authentication</span>
                  <span className="mt-1 block text-slate-400">Enabled for sign-in protection</span>
                </div>
                <div className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3">
                  <span className="block font-medium text-white">Session activity</span>
                  <span className="mt-1 block text-slate-400">Signed in on 2 devices</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4">
              <EmptyState
                title="Preferences"
                description="Notification and language settings can be added here as the profile experience expands."
              />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}