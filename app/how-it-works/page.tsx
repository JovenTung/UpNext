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
    <section className="landing-bg min-h-[90vh] w-full">
      <div className="mx-auto max-w-6xl py-16">
        <h1 className="mb-10 text-center text-3xl font-extrabold md:text-5xl">
          How It Works
        </h1>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <li
              key={s.n}
              className="rounded-xl border bg-white/70 p-5 shadow-sm"
            >
              <div className="mb-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {s.n}
              </div>
              <div className="font-medium">{s.title}</div>
              <div className="text-sm text-slate-600">{s.desc}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
