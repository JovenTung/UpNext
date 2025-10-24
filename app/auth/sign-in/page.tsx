"use client";

import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";

export default function SignInPage() {
  const setUser = useStore((s) => s.setUser);
  const router = useRouter();

  const onSignIn = () => {
    setUser({ id: "demo", name: "Demo User" });
    router.push("/onboarding");
  };

  return (
    <div className="max-w-md space-y-4">
      <h1 className="text-2xl font-semibold">Welcome to UpNext</h1>
      <p className="text-gray-600">
        This is a demo sign-in. Click continue to proceed.
      </p>
      <button
        className="rounded bg-blue-600 px-4 py-2 text-white"
        onClick={onSignIn}
      >
        Continue
      </button>
    </div>
  );
}
