import { SignupForm } from "@/components/signup-form";
import { AuthLayout } from "@/components/auth-layout";

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Get started with Hack Org today"
    >
      <SignupForm />
    </AuthLayout>
  );
}
