import Image from 'next/image'

export default function BenefitsPage() {
  const benefits = [
    {
      title: 'Smart Scheduling',
      desc: 'Splits work into focused 60–90 min sessions.',
      icon: '/benefits/time.png',
    },
    {
      title: 'Personalized',
      desc: 'Adapts to stress & understanding levels.',
      icon: '/benefits/stress.png',
    },
    {
      title: 'Flexible Calendar',
      desc: 'Drag, resize, and reschedule easily.',
      icon: '/benefits/focus.png',
    },
    {
      title: 'Daily Checklist',
      desc: 'Know exactly what to do today.',
      icon: '/benefits/ai.png',
    },
  ]

  return (
    <section className="landing-bg min-h-[90vh] w-full">
      <div className="mx-auto max-w-6xl py-16">
        <h1 className="mb-10 text-center text-3xl font-extrabold md:text-5xl">
          Benefits
        </h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="rounded-xl border bg-white/70 p-5 text-center shadow-sm"
            >
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow">
                <Image src={b.icon} alt={b.title} width={64} height={64} />
              </div>
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-slate-600">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
