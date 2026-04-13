import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'

const requestTypes = ['Vacation', 'Sick leave', 'Personal day', 'Remote work']

export default function EmployeeLeavePage(): JSX.Element {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Leave request"
        description="Submit a new leave request and review the guidelines before sending it to your manager."
      >
        <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Leave type</span>
                <select className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40">
                  {requestTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Duration</span>
                <select className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-400/40">
                  <option>Full day</option>
                  <option>Half day</option>
                  <option>Multiple days</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">Start date</span>
                <input
                  type="date"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-400/40"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-200">End date</span>
                <input
                  type="date"
                  className="h-11 rounded-xl border border-white/10 bg-slate-950/60 px-3 text-sm text-white outline-none transition focus:border-amber-400/40"
                />
              </label>

              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-200">Reason</span>
                <textarea
                  rows={4}
                  placeholder="Add a short note for your manager"
                  className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-amber-400/40"
                />
              </label>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/5">
                Save draft
              </button>
              <button className="inline-flex h-11 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:brightness-105">
                Submit request
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Policy snapshot</p>
              <ul className="mt-3 space-y-3 text-sm text-slate-300">
                <li className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3">
                  <span className="block font-medium text-white">Annual leave balance</span>
                  <span className="mt-1 block text-slate-400">12 days remaining</span>
                </li>
                <li className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3">
                  <span className="block font-medium text-white">Approval flow</span>
                  <span className="mt-1 block text-slate-400">Manager review required</span>
                </li>
                <li className="rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3">
                  <span className="block font-medium text-white">Processing time</span>
                  <span className="mt-1 block text-slate-400">Usually within 1 business day</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 p-4">
              <EmptyState
                title="Leave history"
                description="Approved and pending requests will appear here after your first submission."
              />
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}