import Image from 'next/image'

export default function BenefitsPage() {
  const benefits = [
    {
      title: 'Smart Scheduling',
      desc: 'Splits work into focused 60–90 min sessions.',
      icon: '/benefits/time.png',
    },
    {
      title: 'Personalized Understanding',
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
    <section className="landing-animated min-h-screen w-full">
      {/* center everything vertically + horizontally */}
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="mx-auto w-full max-w-7xl">
            <h2 className="mb-9 text-center text-l md:text-5xl">
              How <span className="text-blue-600">UpNext</span> can help you
            </h2>

          {/* centered grid */}
          <div className="mx-auto grid w-full gap-6 md:grid-cols-2 lg:grid-cols-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="group rounded-xl border bg-white/70 p-6 text-center shadow-md transition-transform transform hover:-translate-y-3 hover:scale-105"
              >
                {/* icon with larger size and subtle gradient puck */}
                <div className="mx-auto mb-4 flex h-30 w-30 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br">
                  <Image
                    src={b.icon}
                    alt={b.title}
                    width={96}
                    height={96}
                    className="h-22 w-22 object-contain transition-transform duration-300 group-hover:scale-110"
                  />
                </div>

                <div className="mb-2 text-lg font-semibold">{b.title}</div>

                {/* short description*/}
                <div className="mb-4 text-sm text-slate-600">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
