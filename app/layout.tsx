import './globals.css'
import type { ReactNode } from 'react'
import NavBar from '@/components/NavBar'
import RouteTransition from '@/components/RouteTransition'

export const metadata = {
  title: 'UpNext',
  description:
    'ML-powered assignment and study planning for university students',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <NavBar />
        <main className="min-h-screen">
          <RouteTransition>{children}</RouteTransition>
        </main>
        <footer>
        </footer>
      </body>
    </html>
  )
}
