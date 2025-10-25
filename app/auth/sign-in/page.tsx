"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";

export default function SignInPage() {
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSignIn = () => {
    setUser({ id: "demo", name: email || "User" });
    router.push("/onboarding");
  };

  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-300 via-violet-300 to-purple-300 text-slate-900">
      {/* background gradient blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-fuchsia-700/35 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-indigo-700/35 blur-2xl" />

      {/*frosted glass card */}
      <section className="mx-4 w-full max-w-md rounded-3xl border border-slate-200/60 bg-white/70 p-8 shadow-xl backdrop-blur-2xl">
        {/* logo/avatar circle */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-slate-200 bg-gradient-to-br from-indigo-200 to-fuchsia-200 text-indigo-700 shadow-inner">
          <svg viewBox="0 0 24 24" className="h-10 w-10" aria-hidden="true">
            <path
              d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
              fill="currentColor"
            />
          </svg>
        </div>
        <div className="max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">
            Welcome to <span className="text-indigo-600">UpNext</span>
          </h1>
        </div>
        {/* input fields */}
        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm text-slate-600">Email ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@student.rmit.edu.au"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none"
            />
          </div>
          <button
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-3 font-medium text-white shadow-md shadow-fuchsia-400/30 ring-1 ring-indigo-100 transition hover:opacity-95 active:opacity-90"
            onClick={onSignIn}
          >
            Continue
          </button>
        </div>
      </section>
    </main>
  );
}
