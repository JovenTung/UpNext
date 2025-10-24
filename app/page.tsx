export default function HomePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">UpNext</h1>
      <p className="text-gray-600 max-w-2xl">
        Plan smarter, not harder. UpNext helps you break down university
        assignments into manageable sessions, scheduled around your preferences
        and deadlines. Tell us how you work, upload your tasks, and we’ll map
        out your study plan day by day.
      </p>
      <ul className="list-disc pl-6 text-gray-700">
        <li>Onboarding questions to tailor your schedule</li>
        <li>Upload assignments and auto-detect deadlines</li>
        <li>Drag-and-drop calendar to adjust sessions</li>
        <li>Daily checklist with time estimates</li>
      </ul>
    </div>
  );
}
