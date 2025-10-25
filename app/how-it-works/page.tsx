export default function HowItWorksPage() {
  const steps = [
    {
      n: 1,
      title: 'Add assignment',
      desc: 'Upload or paste details; we detect due dates.',
    },
    {
      n: 2,
      title: 'Tell us how you work',
      desc: 'Set study windows, confidence, and stress level.',
    },
    {
      n: 3,
      title: 'Get your plan',
      desc: 'Sessions appear on your calendar; drag to tweak.',
    },
  ]

  return (
    <section className="landing-animated min-h-screen w-full">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto w-full max-w-7xl">
            <h2 className="mb-12 text-center text-l md:text-5xl">
              How <span className="text-blue-600">UpNext</span> works
            </h2>

          <div className="mx-auto grid w-full gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="group rounded-xl border bg-white/70 p-6 text-center shadow-md transition-transform transform hover:-translate-y-3 hover:scale-105"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                  {s.n}
                </div>
                <div className="mb-2 text-lg font-semibold">{s.title}</div>
                <div className="mb-4 text-sm text-slate-600">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
