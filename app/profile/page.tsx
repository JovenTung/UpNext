'use client'

import { useStore } from '@/lib/store/useStore'

export default function ProfilePage() {
  const clearAll = useStore((s) => s.clearAll)
  const setUser = useStore((s) => s.setUser)

  return (
    <section className="landing-bg min-h-[90vh] w-full">
      <div className="mx-auto max-w-5xl py-16">
        <h1 className="text-3xl font-extrabold md:text-5xl">Profile</h1>
        <p className="mt-4 text-slate-700">
          Manage your preferences and study profile. (Placeholder page)
        </p>

        <div className="mt-8 flex gap-3">
          <button
            className="rounded-full border px-4 py-2 text-slate-800 hover:bg-white"
            onClick={() => setUser(null)}
          >
            Log out
          </button>
          <button
            className="rounded-full border px-4 py-2 text-slate-800 hover:bg-white"
            onClick={() => clearAll()}
          >
            Reset demo data
          </button>
        </div>
      </div>
    </section>
  )
}
