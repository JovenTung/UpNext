'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import { useStore } from '@/lib/store/useStore'

export default function HomePage() {
  const user = useStore((s) => s.user)
  const router = useRouter()
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  const onTouchStart: React.TouchEventHandler<HTMLElement> = (e) => {
    touchStartX.current = e.changedTouches[0]?.screenX ?? null
  }
  const onTouchEnd: React.TouchEventHandler<HTMLElement> = (e) => {
    touchEndX.current = e.changedTouches[0]?.screenX ?? null
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const deltaX = touchStartX.current - touchEndX.current
      if (deltaX > 60) router.push('/benefits')
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  if (user) {
    return <LoggedInHome />
  }

  return (
    <section
      className="landing-animated h-[100dvh] w-full overflow-hidden overscroll-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-6 text-center">
        <h1 className="whitespace-nowrap text-3xl font-extrabold md:text-5xl">
          An Assignment Planner That Actually{' '}
          <span className="text-blue-600">Gets</span> You
        </h1>
        <p className="max-w-2xl text-slate-700">
          Upload your assignments, tell us how you work, and get a plan that
          adapts to your time, focus, and stress.
        </p>
        <br />

        <div className="relative grid w-full grid-cols-1 items-center gap-8 md:grid-cols-3">
          {/* Left floating icons */}
          <div className="order-2 flex flex-col items-center gap-8 md:order-1">
            <IconCard
              label="Stress Management"
              className="animate-float"
              src="/benefits/stress.png"
              alt="Stress management"
            />
            <IconCard
              label="Time Management"
              className="animate-float-delay"
              src="/benefits/time.png"
              alt="Time management"
            />
          </div>

            {/* Center illustration */}
          <div className="order-1 mx-auto md:order-2">
            <div className="relative mx-auto flex w-full max-w-full flex-col items-center">
              {/* smaller glass ring (fixed size) */}
              <div className="relative w-[300px] h-[300px] rounded-full border border-white/20 bg-white/8 p-1 shadow-xl backdrop-blur-lg supports-[backdrop-filter]:bg-white/8 overflow-visible align-middle justify-content-center">
              {/* gloss overlay clipped to the ring */}
              <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden">
                {/* soft diagonal sheen */}
                <div className="absolute -top-10 -left-10 w-64 h-40 -rotate-20 blur-xl opacity-100 mix-blend-screen bg-gradient-to-br from-white/80 via-white/30 to-transparent" />
                {/* subtle top-right specular highlight */}
                <div className="absolute top-6 right-6 w-28 h-10 rounded-full bg-gradient-to-r from-white/40 to-transparent opacity-40 blur-sm" />
              </div>

              {/* image positioned absolutely so it can be larger than the ring */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none align-middle justify-items-center">
                <div className="w-[250px] h-[250px] -translate-y--1 z-20 align-middle justify-items-center">
                <Image
                  src="/branding/logo.png"
                  alt="UpNext logo"
                  width={420}
                  height={420}
                  priority
                  className="h-full w-full rounded-full object-cover"
                />
                </div>
              </div>

                {/* thin ring overlay (behind the image) */}
                <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-black/5 z-10" />
              </div>
            </div>

            <h1 className="mt-4 text-3xl font-extrabold md:text-5xl">UpNext</h1>
          </div>

          {/* Right floating icons */}
          <div className="order-3 flex flex-col items-center gap-8">
            <IconCard
              label="Adaptive AI Support"
              className="animate-float"
              src="/benefits/ai.png"
              alt="Adaptive AI support"
            />
            <IconCard
              label="Focus Optimization"
              className="animate-float-delay"
              src="/benefits/focus.png"
              alt="Focus optimization"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function LoggedInHome() {
  const name = useStore((s) => s.user?.name ?? 'Student')
  return (
    <section className="loggedIn-bg min-h-[100vh] w-full">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <h1 className="text-2xl md:text-3xl">
          Good morning <span className="font-extrabold">{name}</span>, here’s
          your focus for today.
        </h1>

        <div className="mt-10 rounded-2xl border bg-white/70 p-10 shadow-sm">
          <h2 className="text-3xl font-extrabold text-center">
            Upcoming assignment
          </h2>
        </div>

        <div className="mt-8 rounded-2xl border bg-white/70 p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white/90">
                Monthly
              </span>
              <span className="px-3 py-1 text-xs text-slate-600">Weekly</span>
              <span className="px-3 py-1 text-xs text-slate-600">Daily</span>
            </div>
            <button
              aria-label="Add"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
            >
              +
            </button>
          </div>
          <div className="h-[360px] rounded-xl bg-slate-200/70">
            <div className="flex h-full items-center justify-center text-3xl font-extrabold">
              Calendar
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function IconCard({
  label,
  className,
  src,
  alt,
}: {
  label: string
  className?: string
  src: string
  alt: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-20 w-20 items-center justify-center overflow-hidden ${
          className ?? ''
        }`}
      >
        <Image src={src} alt={alt} width={80} height={80} />
      </div>
      <div className="text-s text-slate-600">{label}</div>
    </div>
  )
}
