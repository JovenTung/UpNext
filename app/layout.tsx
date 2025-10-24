import "./globals.css";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "UpNext",
  description:
    "ML-powered assignment and study planning for university students",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b">
          <nav className="container flex h-14 items-center gap-6 text-sm">
            <Link href="/" className="font-semibold">
              UpNext
            </Link>
            <div className="ml-auto flex items-center gap-4">
              <Link href="/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/upload" className="hover:underline">
                Upload
              </Link>
              <Link href="/onboarding" className="hover:underline">
                Onboarding
              </Link>
              <Link href="/auth/sign-in" className="hover:underline">
                Sign in
              </Link>
            </div>
          </nav>
        </header>
        <main className="container py-8">{children}</main>
        <footer className="border-t mt-12">
          <div className="container py-6 text-xs text-gray-500">
            © {new Date().getFullYear()} UpNext
          </div>
        </footer>
      </body>
    </html>
  );
}
