# UpNext
Hackathon Project Team - Kopicode

## Inspiration
University students face a high cognitive load from numerous overlapping assignments, which can lead to stress, burnout, and procrastination. Existing tools are either generic calendars or rigid to‑do lists. They lack personalised feedback about how long tasks actually take and how to break work into realistic sessions. UpNext was built to close that gap: an assignment planner that adapts to deadlines, personal study habits, stress levels, and self‑rated proficiency.

## What it does
-Lets students add assignments by uploading a PDF specification or by pasting text.
-Generates a simple, actionable plan that splits work into sessions and places them before the deadline.
-Provides a central dashboard showing upcoming work, progress indicators, and a calendar view to adjust sessions.
-Lightweight local persistence so students can try the planner quickly without signup.
-Polished UI with an animated landing background, glass-style navbar, and smooth page transitions.

## How we built it
-Frameworks & tools: Next.js (App Router) + React + TypeScript.
-Styling: Tailwind CSS with a small global stylesheet for the animated gradient and glass effects.
-State: Zustand for client-side state and persistence.
-Motion: Framer Motion for simple, tweened route transitions and card micro-interactions.
-Key pages/components:
Add/View Assignments UI (PDF upload or text spec toggle)
Dashboard with upcoming assignments and progress ring
Reusable RouteTransition and ProgressRing components

## Challenges we ran into
-Time constraints: planned AI-driven scheduling and personalized prediction were not completed within the project scope.
-SSR/CSR issues: date localization and client-only hooks initially caused hydration mismatches; resolved by using deterministic formatting and client-side handling where appropriate.
-UX layout edge cases: fixed navbar vs full-bleed backgrounds required iteration to avoid visual overlap and clipping on different screens.

## Accomplishments that we're proud of
-Functional Add/View assignment flow supporting both PDF and text specs, with immediate feedback (filename, active mode) and persisted state.
-Clean, responsive UI with cohesive animations and visual polish that lowers friction for students.
-Robust fixes for client/server rendering mismatches and route transitions so the app builds and runs reliably.

## What we learned
-Practical App Router patterns and the importance of server/client boundaries.
-How small UX details (toggle states, filename feedback, smooth transitions) materially improve usability.
-Teamwork and delivering features under tight time constraints.

## What's next for UpNext
-Add the planned AI component to predict session lengths and produce personalized pacing.
-Build backend storage and authentication so users can sync plans across devices and upload PDFs reliably.
-Improve planner intelligence by learning from actual completion times and adjusting future estimates.
-Integrate calendar sync (Google/Apple) and reminders for proactive nudges.
