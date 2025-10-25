"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";

/* helpers*/
const BrandBtn: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { full?: boolean }
> = ({ children, full, className = "", ...props }) => (
  <button
    className={[
      full ? "w-full" : "",
      "rounded-2xl bg-[#0F205A] px-5 py-3 text-white font-semibold shadow-md",
      "transition hover:opacity-95 active:opacity-90",
      className,
    ].join(" ")}
    {...props}
  >
    {children}
  </button>
);

/* standard padding + vertical rhythm for each step */
const Step: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="w-full max-w-2xl space-y-6 px-6 py-10 sm:px-10 sm:py-12">
    {children}
  </div>
);

const Pill: React.FC<{
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={[
      "rounded-full px-4 py-2 text-sm transition ring-1",
      active
        ? "bg-[#0F205A] text-white ring-[#0F205A]"
        : "bg-white/70 text-slate-900 ring-[#CCD8E1]/60",
      "hover:-translate-y-[1px] hover:shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-[#0F205A]/40",
    ].join(" ")}
  >
    {children}
  </button>
);

/* subjects mini */
type Subject = { id: string; name: string; color: string };
const SUBJECT_COLORS = ["#E57373", "#64B5F6", "#81C784", "#FFD54F", "#9575CD"];

function SubjectsMini({
  subjects,
  setSubjects,
}: {
  subjects: Subject[];
  setSubjects: (s: Subject[]) => void;
}) {
  const gen = useId();
  const [name, setName] = useState("");
  const [color, setColor] = useState(SUBJECT_COLORS[1]);

  const add = () => {
    const n = name.trim();
    if (!n) return;
    setSubjects([
      ...subjects,
      { id: crypto.randomUUID?.() ?? gen, name: n, color },
    ]);
    setName("");
  };
  const remove = (id: string) =>
    setSubjects(subjects.filter((x) => x.id !== id));

  return (
    <div className="mx-auto max-w-xl space-y-4">
      {/* input row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Enter subject name here…"
          className="flex-1 rounded-2xl border border-[#CCD8E1]/60 bg-white/80 px-4 py-3 text-sm placeholder:text-slate-500 focus:border-[#0F205A]/50 focus:outline-none"
        />
        <div className="flex items-center gap-2">
          {SUBJECT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className="h-7 w-7 rounded-full ring-2 ring-white outline-none focus:ring-4 focus:ring-[#0F205A]/30"
              style={{
                background: c,
                boxShadow:
                  color === c ? `0 0 0 2px ${c}66, 0 0 0 4px #fff` : undefined,
              }}
              aria-label={`choose ${c}`}
            />
          ))}
        </div>
        <BrandBtn onClick={add}>Add subject</BrandBtn>
      </div>

      {/* list */}
      <div className="space-y-2">
        {subjects.map((s) => (
          <div
            key={s.id}
            className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-2 ring-1 ring-[#CCD8E1]/60"
            style={{ boxShadow: `inset 0 0 0 9999px ${s.color}20` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full ring-2 ring-white"
                style={{ background: s.color }}
              />
              <span className="font-semibold">{s.name}</span>
            </div>
            <button
              onClick={() => remove(s.id)}
              className="h-8 w-8 rounded-full bg-white/80 text-slate-700 ring-1 ring-[#CCD8E1]/60 hover:bg-slate-100"
              title="Remove"
            >
              —
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* onboarding */
export default function OnboardingPage() {
  const router = useRouter();
  const setUser = useStore((s) => s.setUser);

  const [step, setStep] = useState(0);

  // answers
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [taskStyle, setTaskStyle] =
    useState<"break" | "all" | "mix" | null>(null);
  const [sessionPref, setSessionPref] =
    useState<"short" | "long" | null>(null);
  const [focusTime, setFocusTime] =
    useState<"morning" | "afternoon" | "night" | null>(null);
  const [stress, setStress] = useState(3);
  const [goal, setGoal] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: "s1", name: "Data Science", color: "#E57373" },
    { id: "s2", name: "Algorithms & Analysis", color: "#81C784" },
  ]);

  const next = () => setStep((s) => Math.min(s + 1, 8));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const done = () => {
    setUser({ id: "demo", name: name || "Student", course } as any);
    router.push("/");
  };

  return (
    <section className="min-h-[100vh] loggedIn-bg pt-28">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-4 text-center">
        {/* step content */}
        {step === 0 && (
          <Step>
            <h1 className="text-2xl font-semibold">
              Welcome to <span className="font-extrabold">UpNext</span>, what
              is your preferred name?
            </h1>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type here..."
              className="mx-auto w-full max-w-lg rounded-2xl border border-[#CCD8E1]/60 bg-white/70 px-4 py-3 text-center text-slate-900 placeholder:text-slate-500 focus:border-[#0F205A]/50 focus:outline-none"
            />
            <div className="mt-6 flex justify-end">
              <BrandBtn onClick={next}>Next</BrandBtn>
            </div>
          </Step>
        )}

        {step === 1 && (
          <Step>
            <h2 className="text-2xl font-semibold">
              Hello{name ? `, ${name}` : ""}.
            </h2>
            <p>
              To provide the best possible recommendations, I’ll ask a few quick
              questions.
            </p>
            <div className="mt-6 flex justify-center">
              <BrandBtn onClick={next}>Got it!</BrandBtn>
            </div>
          </Step>
        )}

        {step === 2 && (
          <Step>
            <h3 className="text-2xl font-semibold">
              What is the name of your course?
            </h3>
            <input
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              placeholder="Type here..."
              className="mx-auto w-full max-w-lg rounded-2xl border border-[#CCD8E1]/60 bg-white/70 px-4 py-3 text-center text-slate-900 placeholder:text-slate-500 focus:border-[#0F205A]/50 focus:outline-none"
            />
            <div className="mt-6 mx-auto flex w-full max-w-lg justify-between">
              <BrandBtn onClick={back} className="bg-[#0F205A]/80">
                Back
              </BrandBtn>
              <BrandBtn onClick={next}>Next</BrandBtn>
            </div>
          </Step>
        )}

        {step === 3 && (
          <Step>
            <h3 className="text-2xl font-semibold">
              How do you usually approach big tasks?
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Pill active={taskStyle === "break"} onClick={() => setTaskStyle("break")}>
                Break into smaller parts
              </Pill>
              <Pill active={taskStyle === "all"} onClick={() => setTaskStyle("all")}>
                Do it all at once
              </Pill>
              <Pill active={taskStyle === "mix"} onClick={() => setTaskStyle("mix")}>
                Mix of both
              </Pill>
            </div>
            <div className="mt-6 mx-auto flex w-full max-w-lg justify-between">
              <BrandBtn onClick={back} className="bg-[#0F205A]/80">
                Back
              </BrandBtn>
              <BrandBtn onClick={next}>Next</BrandBtn>
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step>
            <h3 className="text-2xl font-semibold">
              Do you prefer shorter frequent sessions or longer focused blocks?
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Pill active={sessionPref === "short"} onClick={() => setSessionPref("short")}>
                Shorter frequent sessions
              </Pill>
              <Pill active={sessionPref === "long"} onClick={() => setSessionPref("long")}>
                Longer focused sessions
              </Pill>
            </div>
            <div className="mt-6 mx-auto flex w-full max-w-lg justify-between">
              <BrandBtn onClick={back} className="bg-[#0F205A]/80">
                Back
              </BrandBtn>
              <BrandBtn onClick={next}>Next</BrandBtn>
            </div>
          </Step>
        )}

        {step === 5 && (
          <Step>
            <h3 className="text-2xl font-semibold">
              When are you usually most focused?
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Pill active={focusTime === "morning"} onClick={() => setFocusTime("morning")}>
                Morning
              </Pill>
              <Pill active={focusTime === "afternoon"} onClick={() => setFocusTime("afternoon")}>
                Afternoon
              </Pill>
              <Pill active={focusTime === "night"} onClick={() => setFocusTime("night")}>
                Night
              </Pill>
            </div>
            <div className="mt-6 mx-auto flex w-full max-w-lg justify-between">
              <BrandBtn onClick={back} className="bg-[#0F205A]/80">
                Back
              </BrandBtn>
              <BrandBtn onClick={next}>Next</BrandBtn>
            </div>
          </Step>
        )}

        {step === 6 && (
          <Step>
            <h3 className="text-2xl font-semibold">
              How stressed do you feel about your studies right now?
            </h3>
            <div className="mx-auto flex max-w-xl items-center gap-4">
              <span className="text-sm text-slate-700">1</span>
              <input
                type="range"
                min={1}
                max={5}
                value={stress}
                onChange={(e) => setStress(parseInt(e.target.value))}
                className="w-full accent-[#0F205A]"
              />
              <span className="text-sm text-slate-700">5</span>
            </div>
            <p className="text-sm text-slate-700">Current: {stress} / 5</p>
            <div className="mt-6 mx-auto flex w-full max-w-lg justify-between">
              <BrandBtn onClick={back} className="bg-[#0F205A]/80">
                Back
              </BrandBtn>
              <BrandBtn onClick={next}>Next</BrandBtn>
            </div>
          </Step>
        )}

        {step === 7 && (
          <Step>
            <h3 className="text-2xl font-semibold">
              What’s your main goal this semester?
            </h3>
            <p className="text-sm text-slate-800">
              For example: Get HDs / Pass everything / Keep stress low / Balance
              work and uni
            </p>
            <input
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Type here..."
              className="mx-auto w-full max-w-lg rounded-2xl border border-[#CCD8E1]/60 bg-white/70 px-4 py-3 text-center placeholder:text-slate-500 focus:border-[#0F205A]/50 focus:outline-none"
            />
            <div className="mt-6 mx-auto flex w-full max-w-lg justify-between">
              <BrandBtn onClick={back} className="bg-[#0F205A]/80">
                Back
              </BrandBtn>
              <BrandBtn onClick={next}>Next</BrandBtn>
            </div>
          </Step>
        )}

        {step === 8 && (
          <Step>
            <h3 className="text-2xl font-semibold">
              Thank you for answering all the questions!
            </h3>
            <p className="text-sm">
              You can add your enrolled subjects now or anytime later in your
              Profile.
            </p>
            <SubjectsMini subjects={subjects} setSubjects={setSubjects} />
            <div className="mt-6 mx-auto flex w-full max-w-xl justify-end">
              <BrandBtn onClick={done}>Done</BrandBtn>
            </div>
          </Step>
        )}
      </div>
    </section>
  );
}
