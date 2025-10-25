# Kopicode — UpNext

## Team / Members
- Kopicode
- Zi Jian Tung (Joven)
- Wen Hui Chew (Evelyn)
- Janna Ng

---

## Project Scope (A1, A2, A3)

### A1 — Problem / Relevance
University students face overlapping assignments, unclear effort estimates, and limited personalised feedback about how to break work into realistic sessions. That gap causes stress, procrastination, and lower-quality learning. UpNext targets this problem by offering an adaptive planner that helps students break assignments into manageable sessions, visualises progress, and produces deadline-aware suggestions. The project scope is focused and realistic: a client-first Next.js app with local persistence for quick validation and a clear upgrade path to a server-backed, AI-powered scheduler.

### A2 — Project / Desirability
- Technical feasibility: implemented with Next.js (App Router), TypeScript, Tailwind CSS, Zustand (state persistence), and Framer Motion (animations). The codebase is structured so the scheduling logic is modular and can be upgraded to a server-side or ML-backed implementation.
- Key risks and mitigations:
  - SSR/CSR mismatches (date localization, query params) — mitigated by deterministic date helpers and client-only effects where necessary.
  - File upload and storage complexity — mitigated by showing uploaded filenames client-side and deferring binary storage to a future server-backed upload/Cloud Storage flow.
  - Scheduling scale and accuracy — mitigated by isolating the scheduling algorithm behind an API boundary so it can be replaced by a more accurate ML service without touching UI code.
- Implementation plan (next steps):
  1. Add backend storage and authentication (Next API routes or Node service + database).
  2. Implement AI/ML-based session-length prediction and adaptive rescheduling.
  3. Calendar sync (Google/Apple) and reminders.

### A3 — Target Users
- Primary users: University students juggling multiple concurrent assignments and exams.
- Example personas:
  - Maya (2nd-year CS): has 4–6 assignments weekly and needs stepwise, time-boxed plans.
  - Arif (final-year student): balancing project and coursework; needs deadlines broken into milestones.
- Justification: these personas represent common student pain points—information overload, uncertainty about how long tasks take, and last-minute cramming. UpNext reduces cognitive load by suggesting realistic sessions and visual progress.

---

## Design Intentions (C1, C2)

### C1 — User Interface
- Colour scheme: calm, low-stress palette (white → light-blue accents → dark navy for primary actions). High contrast is used for text to ensure readability.
- Typography: system font stack for performance and accessibility, with a clear scale for headings, body text, and microcopy.
- Visual hierarchy: persistent top nav, centered content, clear cards for assignments and recommendations. Primary actions use pill buttons; secondary actions use subtle rings and glass effects.
- Cohesion: consistent pill and glass motifs across nav, cards, and controls; motion is limited and purposeful to avoid distraction.

### C2 — User Experience 
- Intuitive flows: Add / View segmented control for assignments; clear PDF vs Text spec toggle; visible filename for uploads.
- Accessibility & usability: keyboard-focusable controls, visible focus outlines, and reduced-motion support via media queries.
- Navigation: simple top nav and internal tabs for Add/View flows; feedback patterns (toggle color change, filename display, progress ring) provide immediate responses to user actions.

---

## Development Solutions (D2)

- Scheduler module (design + complexity)
  - Purpose: split total estimated effort E into sessions of preferred length L and assign them into available time slots before a deadline. The module is written to be modular so it can be swapped out for a remote ML-based planner later.
  - Complexity: sorting availability slots O(m log m) plus a greedy linear assignment O(n + m) where n is number of sessions and m is the number of slots.

- Meaningful API & modular backend design
  - The client is designed to call a single scheduling endpoint (e.g., `/api/plan`) with assignment metadata ({ dueDate, effort, preferredLength, availability }). The API returns scheduled sessions. This interface decouples UI behavior from scheduling logic and enables scaling (caching, batch processing, ML models) on the server.
  - Example advantages: improved accuracy when using server-side compute or ML models; easier testing of scheduling logic; ability to store session history for personalization.

These elements demonstrate a considered backend design with clear complexity characteristics and an upgrade path for future work.


## Technologies Used (D3)
- Framework: Next.js (App Router) + React + TypeScript
- Styling: Tailwind CSS + `styles/globals.css` for small global polish (animated background)
- State management: Zustand (client-side persistence)
- Motion: Framer Motion (route transitions)
- Optional planned tools: Node/Express or Next API routes, PostgreSQL + Prisma, NextAuth for auth, optional ML infra for scheduler

Project structure (high level):

- app/
  - page.tsx (landing)
  - dashboard/page.tsx
  - assignments/page.tsx
  - benefits/page.tsx
- components/
  - NavBar.tsx
  - RouteTransition.tsx
  - ProgressRing.tsx
- lib/
  - store/useStore.ts
  - types.ts
  - scheduler.ts (planned)
- styles/
  - globals.css

---

## PART B: Setup and User Guide

Prerequisites
- Node.js 18+ (recommended)
- npm (or yarn)

Install and run (development)

```bash
git clone <your-repo-url>
cd UpNext
npm install
npm run dev
# open http://localhost:3000
```

Build & run (production)

```bash
npm run build
npm run start
```

Quick user guide (assignments)

- Add new assignment
  1. Go to Assignments → Add new assignment.
  2. Choose `Select PDF file` (shows filename) or `Enter Text` (activates text input).
  3. Fill subject, title, due date, sliders (understanding/confidence), and optional start/comfortable-by dates.
  4. Click Add — the assignment is saved locally and appears in View.

- View assignments
  - Browse assignment cards containing due date, title, and a progress ring.


