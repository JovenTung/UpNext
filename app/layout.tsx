import './globals.css'
import type { ReactNode } from 'react'
import NavBar from '@/components/NavBar'

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
        <main className="min-h-screen">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-6 text-xs text-gray-500">
            © {new Date().getFullYear()} UpNext
          </div>
        </footer>
      </body>
    </html>
  )
}
