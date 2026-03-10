import { OnboardingForm } from "@/components/onboarding-form";
import { AuthLayout } from "@/components/auth-layout";

export default function OnboardingPage() {
  return (
    <AuthLayout
      title="Get Started"
      description="Create or join a hackathon to begin"
    >
      <OnboardingForm />
    </AuthLayout>
  );
}