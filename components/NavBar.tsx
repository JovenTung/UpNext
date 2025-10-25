'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useStore } from '@/lib/store/useStore'

export default function NavBar() {
  const user = useStore((s) => s.user)
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname?.startsWith(href)
  }

  const linkClass = (href: string) =>
    `nav-pill ${
      isActive(href) ? 'bg-white font-bold text-slate-900 shadow-sm' : ''
    }`

  return (
    <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="flex items-center gap-4">
        {/* Logo circle button next to centered menu */}
        <Link
          href="/"
          aria-label="UpNext Home"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/40 bg-white/70 shadow backdrop-blur-md hover:bg-white"
        >
          <img src="/branding/logo.png" alt="UpNext Logo" className="h-10 w-10" />
        </Link>

        {/* Glass menu */}
        <nav className="flex items-center gap-2 rounded-full border border-white/40 bg-white/30 px-4 py-2.5 shadow-lg backdrop-blur-md">
          {!user ? (
            <>
              <Link href="/" className={linkClass('/')}>
                Homepage
              </Link>
              <Link href="/benefits" className={linkClass('/benefits')}>
                Benefits
              </Link>
              <Link href="/how-it-works" className={linkClass('/how-it-works')}>
                How It Works
              </Link>
              <Link href="/auth/sign-in" className={linkClass('/auth')}>
                Login
              </Link>
            </>
          ) : (
            <>
              <Link href="/" className={linkClass('/')}>
                Dashboard
              </Link>
              <Link href="/assignments" className={linkClass('/assignments')}>
                Assignments
              </Link>
              <Link href="/exams" className={linkClass('/exams')}>
                Exams
              </Link>
              <Link href="/profile" className={linkClass('/profile')}>
                Profile
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}
