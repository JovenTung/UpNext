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
      className="landing-bg min-h-screen w-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 py-20 text-center">
        <h1 className="text-3xl font-extrabold md:text-5xl">
          An Assignment Planner That Actually{' '}
          <span className="text-rose-500">Gets</span> You
        </h1>
        <p className="max-w-2xl text-slate-700">
          Upload your assignments, tell us how you work, and get a plan that
          adapts to your time, focus, and stress.
        </p>

        <div className="relative mt-10 grid w-full grid-cols-1 items-center gap-8 md:grid-cols-3">
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
            <Image
              src="/landing/hero-3d.png"
              alt="UpNext study planner illustration"
              width={560}
              height={420}
              priority
              className="animate-float-slow"
            />
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
    <section className="min-h-screen w-full bg-slate-100/70">
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
        className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow ${
          className ?? ''
        }`}
      >
        <Image src={src} alt={alt} width={64} height={64} />
      </div>
      <div className="text-xs text-slate-600">{label}</div>
    </div>
  )
}
