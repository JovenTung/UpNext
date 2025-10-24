import OnboardingForm from "@/components/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Tell us how you work</h1>
      <p className="text-gray-600">
        We’ll tailor your study plan to your preferences.
      </p>
      <OnboardingForm />
    </div>
  );
}
